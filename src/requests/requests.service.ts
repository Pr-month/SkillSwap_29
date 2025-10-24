import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Request } from '../entities/request.entity';
import { User } from '../entities/user.entity';
import { Skill } from '../entities/skill.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '../enums/request-status.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  // Создание заявки
  async create(
    createRequestDto: CreateRequestDto,
    userId: string,
  ): Promise<Request> {
    const { receiverId, offeredSkillId, requestedSkillId } = createRequestDto;

    // Проверяем существование пользователей и навыков
    const [receiver, offeredSkill, requestedSkill] = await Promise.all([
      this.userRepository.findOne({ where: { id: receiverId } }),
      this.skillRepository.findOne({
        where: { id: offeredSkillId },
        relations: ['owner'],
      }),
      this.skillRepository.findOne({
        where: { id: requestedSkillId },
        relations: ['owner'],
      }),
    ]);

    if (!receiver || !offeredSkill || !requestedSkill) {
      throw new NotFoundException('Пользователь или навык не найден');
    }

    if (offeredSkill.owner.id !== userId) {
      throw new ForbiddenException(
        'Вы не являетесь владельцем предлагаемого навыка',
      );
    }

    if (requestedSkill.owner.id !== receiverId) {
      throw new BadRequestException(
        'Запрашиваемый навык не принадлежит получателю',
      );
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

    return this.requestRepository.save(request);
  }

  // Получение входящих заявок
  async findIncomingRequests(userId: string): Promise<Request[]> {
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
  async findOutgoingRequests(userId: string): Promise<Request[]> {
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
  async markAsRead(id: string, userId: string): Promise<Request> {
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
    userId: string,
  ): Promise<Request> {
    const request = await this.findOne(id);

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

    return this.requestRepository.save(request);
  }
  // Удаление заявки
  async remove(
    id: string,
    userId: string,
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
    const { sender, receiver, offeredSkill, requestedSkill } = request;

    // Получаем полные данные о пользователях
    const [senderUser, receiverUser] = await Promise.all([
      this.userRepository.findOne({
        where: { id: sender.id },
        relations: ['skills'],
      }),
      this.userRepository.findOne({
        where: { id: receiver.id },
        relations: ['skills'],
      }),
    ]);

    if (!senderUser || !receiverUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, что у пользователей еще нет этих навыков
    const senderHasSkill = senderUser.skills.some(
      (skill) => skill.id === requestedSkill.id,
    );
    const receiverHasSkill = receiverUser.skills.some(
      (skill) => skill.id === offeredSkill.id,
    );

    if (!senderHasSkill) {
      senderUser.skills = [...(senderUser.skills || []), requestedSkill];
    }

    if (!receiverHasSkill) {
      receiverUser.skills = [...(receiverUser.skills || []), offeredSkill];
    }

    // Обновляем статус заявки на DONE
    request.status = RequestStatus.DONE;
    request.isRead = false;

    // Сохраняем изменения
    await Promise.all([
      this.userRepository.save(senderUser),
      this.userRepository.save(receiverUser),
      this.requestRepository.save(request),
    ]);
  }
}
