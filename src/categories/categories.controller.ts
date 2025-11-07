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
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRole } from 'src/enums/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HasRoles } from 'src/auth/decorators/roles.decorator';

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
  @ApiBody({ type: CreateCategoryDto })
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
  @ApiParam({ name: 'id', description: 'ID категории' })
  @ApiBody({ type: UpdateCategoryDto })
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
  @ApiParam({ name: 'id', description: 'ID категории' })
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
