import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, DataSource } from 'typeorm';
import { NotificationsGateway } from '@/notifications/notifications.gateway';
import { Request } from '@/entities/request.entity';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '@/enums/request-status.enum';
import { UUID } from 'crypto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly dataSource: DataSource,
  ) {}

  // Создание заявки
  async create(
    createRequestDto: CreateRequestDto,
    userId: UUID,
  ): Promise<Request> {
    const { offeredSkillId, requestedSkillId } = createRequestDto;

    // Проверяем существование навыков и их владельцев
    const [offeredSkill, requestedSkill] = await Promise.all([
      this.skillRepository.findOne({
        where: { id: offeredSkillId },
        relations: ['owner'],
      }),
      this.skillRepository.findOne({
        where: { id: requestedSkillId },
        relations: ['owner'],
      }),
    ]);

    if (!offeredSkill || !requestedSkill || !requestedSkill.owner) {
      throw new NotFoundException('Пользователь или навык не найден');
    }

    const receiverId = requestedSkill.owner.id;

    if (offeredSkill.owner.id !== userId) {
      throw new ForbiddenException(
        'Вы не являетесь владельцем предлагаемого навыка',
      );
    }

    // Запрет самозаявок
    if (receiverId === userId) {
      throw new BadRequestException('Нельзя отправить заявку самому себе');
    }

    // Проверяем существование активной заявки
    const existingRequest = await this.requestRepository.findOne({
      where: {
        sender: { id: userId },
        receiver: { id: receiverId },
        offeredSkill: { id: offeredSkillId },
        requestedSkill: { id: requestedSkillId },
        status: Not(RequestStatus.REJECTED),
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Активная заявка уже существует');
    }

    const request = this.requestRepository.create({
      sender: { id: userId },
      receiver: { id: receiverId },
      offeredSkill: { id: offeredSkillId },
      requestedSkill: { id: requestedSkillId },
      status: RequestStatus.PENDING,
      isRead: false,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Получаем имя отправителя для уведомления
    const sender = await this.userRepository.findOneBy({ id: userId });
    if (!sender) {
      throw new NotFoundException('Отправитель не найден');
    }
    // --- ОТПРАВКА УВЕДОМЛЕНИЯ О НОВОЙ ЗАЯВКЕ ---
    this.notificationsGateway.notifyUser(receiverId, {
      type: 'NEW_REQUEST',
      message: `Поступила новая заявка от пользователя ${sender.name}`,
      requestId: savedRequest.id,
      fromUser: {
        id: sender.id,
        name: sender.name,
      },
    });
    // --- КОНЕЦ ОТПРАВКИ ---

    return savedRequest;
  }

  // Получение входящих заявок
  async findIncomingRequests(userId: UUID): Promise<Request[]> {
    return this.requestRepository.find({
      where: {
        receiver: { id: userId },
        status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
      },
      relations: ['sender', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  // Получение исходящих заявок
  async findOutgoingRequests(userId: UUID): Promise<Request[]> {
    return this.requestRepository.find({
      where: {
        sender: { id: userId },
        status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
      },
      relations: ['receiver', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  // Пометка заявки как прочитанная
  async markAsRead(id: string, userId: UUID): Promise<Request> {
    const request = await this.findOne(id);

    if (request.receiver.id !== userId) {
      throw new ForbiddenException(
        'Только получатель может отмечать заявку как прочитанную',
      );
    }

    request.isRead = true;
    return this.requestRepository.save(request);
  }

  // Изменение статуса заявки
  async updateStatus(
    id: string,
    status: RequestStatus,
    userId: UUID,
  ): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.receiver.id !== userId) {
      throw new ForbiddenException(
        'Только получатель может изменить статус заявки',
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Нельзя изменить статус уже обработанной заявки',
      );
    }

    request.status = status;
    request.isRead = false;

    // Если заявка принята, обмениваем навыки
    if (status === RequestStatus.ACCEPTED) {
      await this.exchangeSkills(request);
    }

    const updatedRequest = await this.requestRepository.save(request);

    // --- ОТПРАВКА УВЕДОМЛЕНИЯ ОБ ИЗМЕНЕНИИ СТАТУСА ---
    if (status === RequestStatus.ACCEPTED) {
      this.notificationsGateway.notifyUser(request.sender.id, {
        type: 'REQUEST_ACCEPTED',
        message: `Ваша заявка пользователю ${request.receiver.name} была принята.`,
        requestId: updatedRequest.id,
        fromUser: { id: request.receiver.id, name: request.receiver.name },
      });
    } else if (status === RequestStatus.REJECTED) {
      this.notificationsGateway.notifyUser(request.sender.id, {
        type: 'REQUEST_REJECTED',
        message: `Ваша заявка пользователю ${request.receiver.name} была отклонена.`,
        requestId: updatedRequest.id,
        fromUser: { id: request.receiver.id, name: request.receiver.name },
      });
    }
    // --- КОНЕЦ ОТПРАВКИ ---

    return updatedRequest;
  }
  // Удаление заявки
  async remove(
    id: string,
    userId: UUID,
    isAdmin: boolean = false,
  ): Promise<void> {
    const request = await this.findOne(id);

    if (!isAdmin && request.sender.id !== userId) {
      throw new ForbiddenException('У вас нет прав на удаление этой заявки');
    }

    await this.requestRepository.remove(request);
  }
  // Поиск по id
  async findOne(id: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    return request;
  }
  // Обмен навыков
  private async exchangeSkills(request: Request): Promise<void> {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const senderRepo = transactionalEntityManager.getRepository(User);
      const skillRepo = transactionalEntityManager.getRepository(Skill);
      const requestRepo = transactionalEntityManager.getRepository(Request);

      const sender = await senderRepo.findOne({
        where: { id: request.sender.id },
        relations: ['skills'],
      });
      const receiver = await senderRepo.findOne({
        where: { id: request.receiver.id },
        relations: ['skills'],
      });
      const offeredSkill = await skillRepo.findOneBy({
        id: request.offeredSkill.id,
      });
      const requestedSkill = await skillRepo.findOneBy({
        id: request.requestedSkill.id,
      });

      if (!sender || !receiver || !offeredSkill || !requestedSkill) {
        throw new NotFoundException(
          'Один из участников обмена или навыков не найден',
        );
      }

      // Добавляем навыки, если их еще нет
      const senderHasSkill = sender.skills.some(
        (s) => s.id === requestedSkill.id,
      );
      if (!senderHasSkill) {
        sender.skills.push(requestedSkill);
      }

      const receiverHasSkill = receiver.skills.some(
        (s) => s.id === offeredSkill.id,
      );
      if (!receiverHasSkill) {
        receiver.skills.push(offeredSkill);
      }

      // Обновляем статус заявки
      request.status = RequestStatus.DONE;
      request.isRead = false;

      await senderRepo.save(sender);
      await senderRepo.save(receiver);
      await requestRepo.save(request);
    });
  }
}
