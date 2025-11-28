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
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRole } from '@/enums/roles.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { HasRoles } from '@/auth/decorators/roles.decorator';
import { Category } from '@/entities/category.entity';
import {
  ApiCreateCategory,
  ApiDeleteCategory,
  ApiGetAllCategories,
  ApiUpdateCategory,
} from './categories.swagger';

@ApiTags('Категории')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiGetAllCategories()
  async getAllCategories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(UserRole.ADMIN)
  @Post()
  @ApiCreateCategory()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(UserRole.ADMIN)
  @Patch(':id')
  @ApiUpdateCategory()
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
  @ApiDeleteCategory()
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
