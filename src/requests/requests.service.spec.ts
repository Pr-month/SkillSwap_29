import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { RequestsService } from './requests.service';
import { Request } from '@/entities/request.entity';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';
import { NotificationsGateway } from '@/notifications/notifications.gateway';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '@/enums/request-status.enum';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepository: jest.Mocked<Repository<Request>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let skillRepository: jest.Mocked<Repository<Skill>>;
  let notificationsGateway: jest.Mocked<NotificationsGateway>;
  let dataSource: DataSource;

  const mockRequest: Partial<Request> = {
    id: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
    status: RequestStatus.PENDING,
  };

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000' as const;

  const createMockUser = (id: string, name: string) =>
    ({
      id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      password: 'password',
      gender: 'male',
      role: 'user',
      refreshToken: '',
      about: `About ${name}`,
      birthdate: new Date('1990-01-01'),
      city: 'Test City',
      avatar: 'test-avatar.jpg',
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as unknown as User;

  const mockUser = createMockUser(mockUserId, 'Test User');

  const createMockSkill = (id: string, name: string) =>
    ({
      id,
      name,
      description: `Description for ${name}`,
      category: { id: 'category-id', name: 'Test Category' },
      owner: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as unknown as Skill;

  const mockSkill: Partial<Skill> = {
    id: '123e4567-e89b-12d3-a456-426614174001' as `${string}-${string}-${string}-${string}-${string}`,
    title: 'Test Skill',
    description: 'Test Description',
    owner: mockUser as User,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest
              .fn()
              .mockImplementation(({ id }) =>
                Promise.resolve(id === mockUserId ? mockUser : null),
              ),
          },
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            findOne: jest.fn(),
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
            createQueryRunner: jest.fn().mockImplementation(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              manager: {
                save: jest.fn(),
                update: jest.fn(),
              },
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
            })),
            transaction: jest.fn().mockImplementation((callback) =>
              callback({
                getRepository: jest.fn().mockReturnValue({
                  findOne: jest.fn(),
                  save: jest.fn(),
                }),
              }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    requestRepository = module.get(getRepositoryToken(Request));
    userRepository = module.get(getRepositoryToken(User));
    skillRepository = module.get(getRepositoryToken(Skill));
    notificationsGateway = module.get(NotificationsGateway);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createRequestDto: CreateRequestDto = {
      offeredSkillId: '123e4567-e89b-12d3-a456-426614174001' as const,
      requestedSkillId: '123e4567-e89b-12d3-a456-426614174002' as const,
    };

    it('should create a new request', async () => {
      const mockOfferedSkill = {
        ...mockSkill,
        id: createRequestDto.offeredSkillId,
        owner: { ...mockUser, id: mockUserId },
      } as Skill;
      const mockRequestedSkill = {
        ...mockSkill,
        id: createRequestDto.requestedSkillId,
        owner: {
          ...mockUser,
          id: '98765432-1234-5678-9012-345678901234' as const,
        },
      } as Skill;

      skillRepository.findOne
        .mockResolvedValueOnce(mockOfferedSkill as Skill)
        .mockResolvedValueOnce(mockRequestedSkill as Skill);

      // Mock existing request check
      requestRepository.findOne.mockResolvedValueOnce(null);

      const createdRequest = { ...mockRequest, ...createRequestDto } as Request;
      requestRepository.create.mockReturnValue(createdRequest);
      requestRepository.save.mockResolvedValue(createdRequest);

      // Mock user repository findOne
      userRepository.findOneBy.mockResolvedValueOnce(mockUser);

      const result = await service.create(createRequestDto, mockUser.id);

      expect(skillRepository.findOne).toHaveBeenCalledTimes(2);
      expect(requestRepository.create).toHaveBeenCalledWith({
        status: RequestStatus.PENDING,
        isRead: false,
        sender: { id: mockUser.id },
        receiver: { id: mockRequestedSkill.owner.id },
        offeredSkill: { id: createRequestDto.offeredSkillId },
        requestedSkill: { id: createRequestDto.requestedSkillId },
      });
      expect(requestRepository.save).toHaveBeenCalledWith(createdRequest);
      expect(notificationsGateway.notifyUser).toHaveBeenCalled();
      expect(result).toEqual(createdRequest);
    });

    it('should throw NotFoundException if skills are not found', async () => {
      skillRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create(createRequestDto, mockUser.id),
      ).rejects.toThrow('Пользователь или навык не найден');
    });

    it('should throw ForbiddenException if user is not the owner of offered skill', async () => {
      const mockOfferedSkill = {
        ...mockSkill,
        id: createRequestDto.offeredSkillId,
        owner: {
          ...mockUser,
          id: 'different-user-id' as `${string}-${string}-${string}-${string}-${string}`,
        },
      } as unknown as Skill;
      const mockRequestedSkill = {
        ...mockSkill,
        id: createRequestDto.requestedSkillId,
        owner: {
          ...mockUser,
          id: '98765432-1234-5678-9012-345678901234' as const,
        },
      } as Skill;

      skillRepository.findOne
        .mockResolvedValueOnce(mockOfferedSkill as Skill)
        .mockResolvedValueOnce(mockRequestedSkill as Skill);

      await expect(
        service.create(createRequestDto, mockUser.id),
      ).rejects.toThrow('Вы не являетесь владельцем предлагаемого навыка');
    });

    it('should throw BadRequestException for self-requests', async () => {
      const mockOfferedSkill = {
        ...mockSkill,
        id: createRequestDto.offeredSkillId,
        owner: { ...mockUser, id: mockUserId },
      } as Skill;
      const mockRequestedSkill = {
        ...mockSkill,
        id: createRequestDto.requestedSkillId,
        owner: { ...mockUser, id: mockUserId },
      } as Skill;

      skillRepository.findOne
        .mockResolvedValueOnce(mockOfferedSkill as Skill)
        .mockResolvedValueOnce(mockRequestedSkill as Skill);

      await expect(
        service.create(createRequestDto, mockUser.id),
      ).rejects.toThrow('Нельзя отправить заявку самому себе');
    });

    it('should throw BadRequestException for duplicate requests', async () => {
      const mockOfferedSkill = {
        ...mockSkill,
        id: createRequestDto.offeredSkillId,
        owner: { ...mockUser, id: mockUserId },
      } as Skill;
      const mockRequestedSkill = {
        ...mockSkill,
        id: createRequestDto.requestedSkillId,
        owner: {
          ...mockUser,
          id: '98765432-1234-5678-9012-345678901234' as const,
        },
      } as Skill;

      skillRepository.findOne
        .mockResolvedValueOnce(mockOfferedSkill as Skill)
        .mockResolvedValueOnce(mockRequestedSkill as Skill);

      // Mock existing request
      requestRepository.findOne.mockResolvedValueOnce({} as Request);

      await expect(
        service.create(createRequestDto, mockUser.id),
      ).rejects.toThrow('Активная заявка уже существует');
    });
  });

  describe('findIncomingRequests', () => {
    it('should return incoming requests for user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRequests = [mockRequest];

      requestRepository.find.mockResolvedValue(mockRequests as Request[]);

      const result = await service.findIncomingRequests(userId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          receiver: { id: userId },
          status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
        },
        relations: ['sender', 'offeredSkill', 'requestedSkill'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('findOutgoingRequests', () => {
    it('should return outgoing requests for user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRequests = [mockRequest];

      requestRepository.find.mockResolvedValue(mockRequests as Request[]);

      const result = await service.findOutgoingRequests(userId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          sender: { id: userId },
          status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
        },
        relations: ['receiver', 'offeredSkill', 'requestedSkill'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('markAsRead', () => {
    it('should mark request as read', async () => {
      const requestId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const mockReceiver = createMockUser(userId, 'Receiver');
      const mockSender = createMockUser('sender-id', 'Sender');

      const mockRequest = {
        id: requestId,
        isRead: false,
        status: RequestStatus.PENDING,
        createdAt: new Date(),
        sender: mockSender,
        receiver: mockReceiver,
      } as unknown as Request;

      // Mock the findOne method from service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest);
      requestRepository.save.mockResolvedValue({
        ...mockRequest,
        isRead: true,
      } as Request);

      const result = await service.markAsRead(requestId, userId);

      expect(service.findOne).toHaveBeenCalledWith(requestId);
      expect(requestRepository.save).toHaveBeenCalledWith({
        ...mockRequest,
        isRead: true,
      });
      expect(result.isRead).toBe(true);
    });

    it('should throw ForbiddenException if user is not the receiver', async () => {
      const requestId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const otherUserId = '00000000-0000-0000-0000-000000000000';

      const mockRequest = {
        id: requestId,
        receiver: { id: otherUserId },
        sender: { id: userId },
      } as unknown as Request;

      // Mock the findOne method from service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);

      await expect(service.markAsRead(requestId, userId)).rejects.toThrow(
        'Только получатель может отмечать заявку как прочитанную',
      );
    });
  });

  describe('updateStatus', () => {
    const requestId = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const status = RequestStatus.ACCEPTED;

    it('should update request status', async () => {
      const mockReceiver = createMockUser(userId, 'Receiver');
      const mockSender = createMockUser('sender-id', 'Sender');

      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        isRead: false,
        createdAt: new Date(),
        sender: mockSender,
        receiver: mockReceiver,
      } as Request;

      requestRepository.findOne.mockResolvedValue(mockRequest);
      requestRepository.save.mockResolvedValue({
        ...mockRequest,
        status,
      } as Request);

      // Mock the exchangeSkills method
      const exchangeSkillsSpy = jest
        .spyOn(service as any, 'exchangeSkills')
        .mockResolvedValue(undefined);

      // Mock the notification gateway
      notificationsGateway.notifyUser = jest.fn().mockResolvedValue(undefined);

      const result = await service.updateStatus(requestId, status, userId);

      expect(requestRepository.findOne).toHaveBeenCalledWith({
        where: { id: requestId },
        relations: ['sender', 'receiver'],
      });

      expect(exchangeSkillsSpy).toHaveBeenCalledWith(mockRequest);

      expect(requestRepository.save).toHaveBeenCalledWith({
        ...mockRequest,
        status,
        isRead: false,
      });

      expect(notificationsGateway.notifyUser).toHaveBeenCalledWith(
        mockSender.id,
        expect.objectContaining({
          type: 'REQUEST_ACCEPTED',
          message: expect.stringContaining('Ваша заявка пользователю'),
          requestId: expect.any(String),
          fromUser: {
            id: mockReceiver.id,
            name: mockReceiver.name,
          },
        }),
      );

      expect(result.status).toBe(status);
      expect(result.isRead).toBe(false);
    });

    it('should throw NotFoundException if request is not found', async () => {
      requestRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(requestId, status, userId),
      ).rejects.toThrow('Заявка не найдена');
    });

    it('should throw ForbiddenException if user is not the receiver', async () => {
      const otherUserId = '00000000-0000-0000-0000-000000000000';
      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        receiver: { id: otherUserId },
        sender: { id: userId },
        createdAt: new Date(),
        offeredSkill: { id: 'offered-skill-id' } as Skill,
        requestedSkill: { id: 'requested-skill-id' } as Skill,
        isRead: false,
      } as unknown as Request;

      requestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.updateStatus(requestId, status, userId),
      ).rejects.toThrow('Только получатель может изменить статус заявки');
    });

    it('should throw BadRequestException if request is not pending', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.ACCEPTED,
        receiver: { id: userId },
        sender: { id: 'sender-id' },
        createdAt: new Date(),
        offeredSkill: { id: 'offered-skill-id' } as Skill,
        requestedSkill: { id: 'requested-skill-id' } as Skill,
        isRead: false,
      } as unknown as Request;

      requestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.updateStatus(requestId, status, userId),
      ).rejects.toThrow('Нельзя изменить статус уже обработанной заявки');
    });

    it('should send rejection notification when status is REJECTED', async () => {
      const mockReceiver = createMockUser(userId, 'Receiver');
      const mockSender = createMockUser('sender-id', 'Sender');

      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        isRead: false,
        createdAt: new Date(),
        sender: mockSender,
        receiver: mockReceiver,
      } as Request;

      requestRepository.findOne.mockResolvedValue(mockRequest);
      requestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.REJECTED,
      } as Request);

      // Mock the notification gateway
      notificationsGateway.notifyUser = jest.fn().mockResolvedValue(undefined);

      await service.updateStatus(requestId, RequestStatus.REJECTED, userId);

      expect(notificationsGateway.notifyUser).toHaveBeenCalledWith(
        mockSender.id,
        expect.objectContaining({
          type: 'REQUEST_REJECTED',
          message: expect.stringContaining('Ваша заявка пользователю'),
          requestId: expect.any(String),
          fromUser: {
            id: mockReceiver.id,
            name: mockReceiver.name,
          },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      const requestId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const mockSender = createMockUser(userId, 'Test User');
      const mockReceiver = createMockUser('receiver-id', 'Receiver');
      const mockOfferedSkill = createMockSkill('skill1', 'Skill 1');
      const mockRequestedSkill = createMockSkill('skill2', 'Skill 2');

      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        isRead: false,
        createdAt: new Date(),
        sender: mockSender,
        receiver: mockReceiver,
        offeredSkill: mockOfferedSkill,
        requestedSkill: mockRequestedSkill,
      } as unknown as Request;

      // Mock the findOne method from service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);
      requestRepository.remove.mockResolvedValue(mockRequest as any);

      await service.remove(requestId, userId);

      expect(service.findOne).toHaveBeenCalledWith(requestId);
      expect(requestRepository.remove).toHaveBeenCalledWith(mockRequest);
    });

    it('should remove a request as admin', async () => {
      const requestId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const isAdmin = true;

      const mockSender = createMockUser('sender-id', 'Test User');
      const mockReceiver = createMockUser('receiver-id', 'Receiver');
      const mockOfferedSkill = createMockSkill('skill1', 'Skill 1');
      const mockRequestedSkill = createMockSkill('skill2', 'Skill 2');

      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        isRead: false,
        createdAt: new Date(),
        sender: mockSender,
        receiver: mockReceiver,
        offeredSkill: mockOfferedSkill,
        requestedSkill: mockRequestedSkill,
      } as unknown as Request;

      // Mock the findOne method from service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);
      requestRepository.remove.mockResolvedValue(mockRequest as any);

      await service.remove(requestId, userId, isAdmin);

      expect(service.findOne).toHaveBeenCalledWith(requestId);
      expect(requestRepository.remove).toHaveBeenCalledWith(mockRequest);
    });

    it('should throw ForbiddenException if user is not the sender', async () => {
      const requestId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const otherUserId = '00000000-0000-0000-0000-000000000000';

      const mockRequest = {
        id: requestId,
        sender: { id: otherUserId },
        receiver: { id: userId },
      } as unknown as Request;

      // Mock the findOne method from service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRequest as any);

      await expect(service.remove(requestId, userId)).rejects.toThrow(
        'У вас нет прав на удаление этой заявки',
      );
    });
  });
});
