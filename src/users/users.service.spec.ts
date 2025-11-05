import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';
import { appConfig } from '@/config/app.config';
import type { IAppConfig } from '@/config/types';
import type { UpdateUserDto } from './dto/update-user.dto';
import { Category } from '@/entities/category.entity';
import { Gender, UserRole } from '@/enums';

// Мокируем модуль bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let skillRepository: { find: jest.Mock };

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockCategoryId = '98765432-1234-5678-9012-345678901234';

  const mockUser: User = {
    id: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    about: 'About test user',
    birthdate: new Date('1990-01-01'),
    city: 'Moscow',
    gender: Gender.UNKNOWN,
    avatar: '',
    role: UserRole.USER,
    refreshToken: '',
    skills: [],
    favoriteSkills: [],
  };

  const mockCategory: Category = {
    id: mockCategoryId,
    name: 'Programming',
    parent: null,
    parentId: mockCategoryId,
    children: [],
    skills: [],
  } as unknown as Category;

  const mockSkill: Skill = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'NestJS Development',
    description: 'NestJS framework development',
    category: mockCategory,
    images: [],
    owner: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockAppConfig: IAppConfig = {
    env: 'test',
    host: 'localhost',
    port: 3000,
    bcryptSalt: 10,
  };

  // Создаем типизированные моки для репозиториев
  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    preload: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    manager: {
      getRepository: jest.fn(),
    },
  };

  const mockSkillRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: appConfig.KEY,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // Настраиваем мок менеджера для возврата мока репозитория скиллов
    mockUserRepository.manager.getRepository.mockImplementation((entity) => {
      if (entity === Skill) {
        return mockSkillRepository;
      }
      throw new Error(`Unexpected repository requested: ${entity}`);
    });

    skillRepository = userRepository.manager.getRepository(
      Skill,
    ) as unknown as {
      find: jest.Mock;
    };

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById', () => {
    it('should find a user by ID and attach their skills', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSkillRepository.find.mockResolvedValue([mockSkill]);

      const result = await service.findOneById(mockUserId);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUserId },
        relations: ['favoriteSkills'],
      });
      expect(skillRepository.find).toHaveBeenCalledWith({
        where: { owner: { id: mockUserId } },
        relations: ['category'],
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUserId);
      expect(result.skills).toEqual([mockSkill]);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      const result = await service.getAllUsers();
      expect(result).toEqual([mockUser]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = { name: 'Updated Name' };

    it('should update and return the user', async () => {
      const preloadedUser = { ...mockUser, ...updateUserDto };
      mockUserRepository.preload.mockResolvedValue(preloadedUser);
      mockUserRepository.save.mockResolvedValue(preloadedUser);

      const result = await service.updateUser(mockUserId, updateUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.preload).toHaveBeenCalledWith({
        id: mockUserId,
        ...updateUserDto,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.save).toHaveBeenCalledWith(preloadedUser);
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      mockUserRepository.preload.mockResolvedValue(null);

      await expect(
        service.updateUser(mockUserId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword456';
    const hashedNewPassword = 'hashedNewPassword';

    beforeEach(() => {
      // Мокируем findOneById, так как он используется внутри updatePassword
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockUser);
    });

    it('should update password if old password matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updatePassword(
        mockUserId,
        oldPassword,
        newPassword,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOneById).toHaveBeenCalledWith(mockUserId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        mockUser.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        newPassword,
        mockAppConfig.bcryptSalt,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.update).toHaveBeenCalledWith(mockUserId, {
        password: hashedNewPassword,
      });
      expect(result).toEqual({ message: 'Пароль успешно обновлен' });
    });

    it('should throw BadRequestException if old password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(mockUserId, oldPassword, newPassword),
      ).rejects.toThrow(BadRequestException);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        mockUser.password,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Переопределяем мок для этого конкретного теста
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.updatePassword(mockUserId, oldPassword, newPassword),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
