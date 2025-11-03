import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('SkillsService', () => {
  let service: SkillsService;
  let skillsRepository: any;
  let userRepository: any;
  const skillId = '1';
  const anotherSkillId = '2';
  const noneExistingSkillId = '-1';
  const userId = '3f7ed030-230c-4b06-bfc7-eeaee7f3f79b';
  const wrongUserId = '3f7ed030-230c-4b06-bfc7-eeaee7f3f79a'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: 'SkillRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn().mockResolvedValue({ id: '1', title: 'Test Skill' }),
            findOne: jest.fn((options) => {
              if (options.where.id === '1') {
                return { id: '1', title: 'Test Skill', owner: { id: userId } };
              }
            }),
          },
        },
        {
          provide: 'UserRepository',
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    skillsRepository = module.get('SkillRepository');
    userRepository = module.get('UserRepository');
  });

  describe('create', () => {
    it('тестируем создание нового навыка', async () => {
      const createSkillDto = { title: 'Test New Skill', description: 'Description new skill', category: 'category-id', images: ['testImage1.jpg', 'testImage2.jpg']};

      const result = await service.create(createSkillDto, userId);

      expect(skillsRepository.create).toHaveBeenCalledWith({
        ...createSkillDto,
        owner: { id: userId },
        category: { id: createSkillDto.category },
      });
      expect(result).toEqual({ id: '1', title: 'Test Skill', owner: { id: userId } });
    });
  });

  describe('findOne', () => {
    it('тестируем поиск навыка', async () => {
      skillsRepository.findOne.mockResolvedValue({ id: skillId, title: 'Test Skill' });

      const result = await service.findOne(skillId);

      expect(skillsRepository.findOne).toHaveBeenCalledWith({ where: { id: skillId }, relations: ['owner'] });
      expect(result).toEqual({ id: skillId, title: 'Test Skill' });
    });
  });

  describe('findAll', () => {
    it('тестируем поиск всех навыков', async () => {
      const query = { page: 1, limit: 10, category: 'category-id', search: 'search-term' };
      const expectedSkills = [
        { id: 'skill-1', title: 'Skill 1', owner: { id: 'owner-1' } },
        { id: 'skill-2', title: 'Skill 2', owner: { id: 'owner-2' } },
      ];
      const totalCount = expectedSkills.length;

      skillsRepository.findAndCount = jest.fn().mockResolvedValue([expectedSkills, totalCount]);

      const result = await service.findAll(query);

      expect(result).toEqual({ data: expectedSkills, count: totalCount });
    });
  });

  describe('findById', () => {
    it('тестируем поиск навыка по ID', async () => {
      const expectedSkill = { id: skillId, title: 'Existing Skill', category: { id: 'category-id', name: 'Category Name' } };

      skillsRepository.findOne = jest.fn().mockResolvedValue(expectedSkill);

      const result = await service.findById(skillId);

      expect(skillsRepository.findOne).toHaveBeenCalledWith({
        where: { id: skillId },
        relations: ['category'],
      });
      expect(result).toEqual(expectedSkill);
    });
  });
  
  describe('update', () => {
    it('тестируем обновление навыка', async () => {
      const updateSkillDto = {
        title: 'Updated Skill',
        description: 'Updated description',
        images: ['updatedImage1.jpg', 'updatedImage2.jpg'],
        category: 'new-category-id',
      };

      const existingSkill = { id: skillId, title: 'Existing Skill', owner: { id: userId } };
      skillsRepository.findOne = jest.fn().mockResolvedValue(existingSkill);
      skillsRepository.save = jest.fn().mockResolvedValue({ ...existingSkill, ...updateSkillDto });
      skillsRepository.merge = jest.fn((skill, updates) => ({ ...skill, ...updates }));

      const result = await service.update(skillId, updateSkillDto, userId);

      expect(skillsRepository.findOne).toHaveBeenCalledWith({ where: { id: skillId }, relations: ['owner'] });
      expect(skillsRepository.merge).toHaveBeenCalledWith(existingSkill, {
        title: updateSkillDto.title,
        description: updateSkillDto.description,
        images: updateSkillDto.images,
      });
      expect(skillsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingSkill,
          title: updateSkillDto.title,
          description: updateSkillDto.description,
          images: updateSkillDto.images,
          category: { id: updateSkillDto.category },
        }),
      );
      expect(result).toEqual({ ...existingSkill, ...updateSkillDto });
    });

    it('тестируем попытку обновить навык другого пользователя', async () => {
      const updateSkillDto = { title: 'Updated Skill', description: 'Updated description' };

      const existingSkill = { id: skillId, title: 'Existing Skill', owner: { id: userId } };
      skillsRepository.findOne = jest.fn().mockResolvedValue(existingSkill);

      await expect(service.update(skillId, updateSkillDto, wrongUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('тестируем удаление навыка', async () => {
      const existingSkill = { id: skillId, title: 'Existing Skill', owner: { id: userId }, images: ['image1.jpg', 'image2.jpg'] };
      skillsRepository.findOne = jest.fn().mockResolvedValue(existingSkill);
      skillsRepository.remove = jest.fn();

      await service.remove(skillId, userId);

      expect(skillsRepository.findOne).toHaveBeenCalledWith({ where: { id: skillId }, relations: ['owner'] });
      expect(skillsRepository.remove).toHaveBeenCalledWith(existingSkill);
    });

    it('тестируем попытку удалить навык другого пользователя', async () => {
      const existingSkill = { id: skillId, title: 'Existing Skill', owner: { id: userId } };
      skillsRepository.findOne = jest.fn().mockResolvedValue(existingSkill);

      await expect(service.remove(skillId, wrongUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addToFavorite', () => {
    it('тестируем добавление навыка в избранное', async () => {
      const user = { id: userId, favoriteSkills: [] };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const skill = { id: skillId, title: 'Skill Title' };
      skillsRepository.findOneBy = jest.fn().mockResolvedValue(skill);

      userRepository.save = jest.fn();

      const result = await service.addToFavorite(userId, skillId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['favoriteSkills'] });
      expect(skillsRepository.findOneBy).toHaveBeenCalledWith({ id: skillId });
      expect(user.favoriteSkills).toEqual([skill]);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual({ message: 'Навык добавлен в избранное' });
    });

    it('тестируем сообщение об ошибке если пользователь не найден', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.addToFavorite(userId, skillId)).rejects.toThrow(NotFoundException);
    });

    it('тестируем сообщение об ошибке если навык не найден', async () => {
      const user = { id: userId, favoriteSkills: [] };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      skillsRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.addToFavorite(userId, noneExistingSkillId)).rejects.toThrow(NotFoundException);
    });

    it('тест если навык уже добавлен в избранное', async () => {
      const user = { id: userId, favoriteSkills: [{ id: skillId }] };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const skill = { id: skillId, title: 'Skill Title' };
      skillsRepository.findOneBy = jest.fn().mockResolvedValue(skill);

      await expect(service.addToFavorite(userId, skillId)).rejects.toThrow(ConflictException);
    });
  });

  describe('removeFromFavorite', () => {
    it('тестируем удаление навыка из избранного', async () => {
      const user = { id: userId, favoriteSkills: [{ id: skillId }, { id: anotherSkillId }] };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      userRepository.save = jest.fn();

      const result = await service.removeFromFavorite(userId, skillId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['favoriteSkills'] });
      expect(user.favoriteSkills).toEqual([{ id: anotherSkillId }]);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual({ message: 'Навык удален из избранного' });
    });

    it('тест если пользователь не найден', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.removeFromFavorite(userId, skillId)).rejects.toThrow(NotFoundException);
    });

    it('тест если навыка нет в избранных', async () => {
      const user = { id: userId, favoriteSkills: [] };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      await expect(service.removeFromFavorite(userId, noneExistingSkillId)).rejects.toThrow(NotFoundException);
    });
  });
});
