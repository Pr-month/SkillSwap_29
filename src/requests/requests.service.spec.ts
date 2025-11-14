import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from '@/entities/request.entity';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';
import { NotificationsGateway } from '@/notifications/notifications.gateway';
import { Repository, DataSource } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '@/enums/request-status.enum';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepo: Repository<Request>;
  let userRepo: Repository<User>;
  let skillRepo: Repository<Skill>;
  let notificationsGateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: NotificationsGateway,
          useValue: {
            notifyUser: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    requestRepo = module.get<Repository<Request>>(getRepositoryToken(Request));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    skillRepo = module.get<Repository<Skill>>(getRepositoryToken(Skill));
    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);
  });

  describe('create', () => {
    const userId = 'user-uuid' as any;
    const receiverId = 'receiver-uuid' as any;
    const createRequestDto: CreateRequestDto = {
      offeredSkillId: 'skill1',
      requestedSkillId: 'skill2',
    };

    it('should create a request successfully', async () => {
      const offeredSkill = { id: 'skill1', owner: { id: userId } };
      const requestedSkill = { id: 'skill2', owner: { id: receiverId } };

      (skillRepo.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'skill1') return offeredSkill;
        if (where.id === 'skill2') return requestedSkill;
      });

      (requestRepo.findOne as jest.Mock).mockResolvedValue(null);
      (requestRepo.create as jest.Mock).mockReturnValue({ id: 'req-id' });
      (requestRepo.save as jest.Mock).mockResolvedValue({ id: 'req-id' });
      (userRepo.findOneBy as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User Name',
      });

      const result = await service.create(createRequestDto, userId);

      expect(result).toEqual({ id: 'req-id' });
      expect(notificationsGateway.notifyUser).toHaveBeenCalledWith(
        receiverId,
        expect.objectContaining({
          type: 'NEW_REQUEST',
        }),
      );
    });

    it('should throw NotFoundException if skills not found', async () => {
      (skillRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      await expect(service.create(createRequestDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner of offered skill', async () => {
      const offeredSkill = { id: 'skill1', owner: { id: 'other-user' } };
      const requestedSkill = { id: 'skill2', owner: { id: receiverId } };

      (skillRepo.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'skill1') return offeredSkill;
        if (where.id === 'skill2') return requestedSkill;
      });

      await expect(service.create(createRequestDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if sender and receiver are the same', async () => {
      const offeredSkill = { id: 'skill1', owner: { id: userId } };
      const requestedSkill = { id: 'skill2', owner: { id: userId } };

      (skillRepo.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'skill1') return offeredSkill;
        if (where.id === 'skill2') return requestedSkill;
      });

      await expect(service.create(createRequestDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if request already exists', async () => {
      const offeredSkill = { id: 'skill1', owner: { id: userId } };
      const requestedSkill = { id: 'skill2', owner: { id: receiverId } };

      (skillRepo.findOne as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'skill1') return offeredSkill;
        if (where.id === 'skill2') return requestedSkill;
      });

      (requestRepo.findOne as jest.Mock).mockResolvedValue({
        id: 'existing-request',
      });

      await expect(service.create(createRequestDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    const requestId = 'req-id' as any;
    const userId = 'receiver-id' as any;
    const mockRequest = {
      id: requestId,
      receiver: { id: userId, name: 'Receiver' },
      sender: { id: 'sender-id', name: 'Sender' },
      status: RequestStatus.PENDING,
      isRead: true,
      offeredSkill: {},
      requestedSkill: {},
    };

    it('should update status and notify sender', async () => {
      (requestRepo.findOne as jest.Mock).mockResolvedValue(mockRequest);
      (requestRepo.save as jest.Mock).mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.ACCEPTED,
      });

      const result = await service.updateStatus(
        requestId,
        RequestStatus.ACCEPTED,
        userId,
      );

      expect(result.status).toBe(RequestStatus.ACCEPTED);
      expect(notificationsGateway.notifyUser).toHaveBeenCalledWith(
        'sender-id',
        expect.objectContaining({
          type: 'REQUEST_ACCEPTED',
        }),
      );
    });

    it('should throw NotFoundException if request not found', async () => {
      (requestRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateStatus(requestId, RequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not receiver', async () => {
      (requestRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockRequest,
        receiver: { id: 'other-id' },
      });
      await expect(
        service.updateStatus(requestId, RequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if status is not PENDING', async () => {
      (requestRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.DONE,
      });
      await expect(
        service.updateStatus(requestId, RequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markAsRead', () => {
    const requestId = 'req-id' as any;
    const userId = 'receiver-id' as any;
    const mockRequest = {
      id: requestId,
      receiver: { id: userId },
      isRead: false,
    };

    it('should mark request as read', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);
      (requestRepo.save as jest.Mock).mockResolvedValue({
        ...mockRequest,
        isRead: true,
      });

      const result = await service.markAsRead(requestId, userId);
      expect(result.isRead).toBe(true);
    });

    it('should throw ForbiddenException if user is not receiver', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...mockRequest,
        receiver: { id: 'other-id' },
      } as any);
      await expect(service.markAsRead(requestId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    const requestId = 'req-id' as any;
    const userId = 'sender-id' as any;
    const mockRequest = { id: requestId, sender: { id: userId } };

    it('should remove request if user is sender', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);
      (requestRepo.remove as jest.Mock).mockResolvedValue(undefined);
      await expect(service.remove(requestId, userId)).resolves.toBeUndefined();
    });

    it('should remove request if user is admin', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);
      (requestRepo.remove as jest.Mock).mockResolvedValue(undefined);
      await expect(
        service.remove(requestId, 'other-user' as any, true),
      ).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException if user is not sender and not admin', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);
      await expect(
        service.remove(requestId, 'other-user' as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findIncomingRequests', () => {
    const userId = 'user-id' as any;

    it('should return incoming requests with correct filters', async () => {
      const mockRequests = [{ id: 'req1' }, { id: 'req2' }];
      (requestRepo.find as jest.Mock).mockResolvedValue(mockRequests);

      const result = await service.findIncomingRequests(userId);
      expect(result).toEqual(mockRequests);
    });
  });

  describe('findOutgoingRequests', () => {
    const userId = 'user-id' as any;

    it('should return outgoing requests with correct filters', async () => {
      const mockRequests = [{ id: 'req1' }, { id: 'req2' }];
      (requestRepo.find as jest.Mock).mockResolvedValue(mockRequests);

      const result = await service.findOutgoingRequests(userId);
      expect(result).toEqual(mockRequests);
    });
  });

  describe('findOne', () => {
    const requestId = 'req-id';

    it('should return request if found', async () => {
      const mockRequest = { id: requestId };
      (requestRepo.findOne as jest.Mock).mockResolvedValue(mockRequest);
      const result = await service.findOne(requestId);
      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException if request not found', async () => {
      (requestRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(requestId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
