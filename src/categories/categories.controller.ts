import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRole } from '@/enums/roles.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { HasRoles } from '@/auth/decorators/roles.decorator';
import { Category } from '@/entities/category.entity';

@ApiTags('Категории')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все категории',
    description: 'Позволяет получить список всех категорий',
  })
  @ApiResponse({
    status: 200,
    description: 'Список категорий успешно получен',
    type: [Category],
  })
  async getAllCategories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(UserRole.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Создать новую категорию',
    description: 'Доступно только для администраторов',
  })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные для создания категории',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({
    status: 409,
    description: 'Категория с таким названием уже существует на данном уровне',
  })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      'Создание категории': {
        summary: 'Пример создания категории',
        description: 'В этом примере создается категория "Программирование".',
        value: { name: 'Программирование' },
      },
      'Создание подкатегории': {
        summary: 'Пример создания подкатегории',
        description:
          'В этом примере создается подкатегория "Веб-разработка" внутри существующей категории.',
        value: {
          name: 'Веб-разработка',
          parentId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        },
      },
    },
  })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(UserRole.ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновить категорию',
    description: 'Доступно только для администраторов',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные для обновления категории',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @ApiParam({
    name: 'id',
    description: 'ID категории для обновления',
    example: 'cfd8ef51-a19e-40f5-9fdb-518a0696c118',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    examples: {
      'Изменение названия': {
        summary: 'Изменить название категории',
        value: { name: 'Новое название' },
      },
      'Перемещение категории': {
        summary: 'Переместить категорию в другую родительскую',
        value: { parentId: 'cfd8ef51-a19e-40f5-9fdb-518a0696c118' },
      },
    },
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить категорию',
    description: 'Доступно только для администраторов',
  })
  @ApiResponse({ status: 204, description: 'Категория успешно удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @ApiParam({
    name: 'id',
    description: 'ID категории для удаления',
    example: 'cfd8ef51-a19e-40f5-9fdb-518a0696c118',
  })
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
