import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Patch,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { AuthRequest } from '@/auth/types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Skill } from '@/entities/skill.entity';

@ApiTags('Навыки')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список навыков',
    description: 'Возвращает отфильтрованный список навыков',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество элементов на странице',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поиск по названию навыка',
  })
  @ApiOkResponse({
    description: 'Список навыков успешно получен',
    type: [Skill],
  })
  async findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить навык по ID',
    description: 'Возвращает информацию о навыке по его идентификатору',
  })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiOkResponse({ description: 'Навык успешно найден', type: Skill })
  @ApiNotFoundResponse({ description: 'Навык не найден' })
  async findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Создать новый навык',
    description: 'Доступно только для авторизованных пользователей',
  })
  @ApiBody({ type: CreateSkillDto })
  @ApiCreatedResponse({ description: 'Навык успешно создан', type: Skill })
  @ApiBadRequestResponse({ description: 'Неверные данные для создания навыка' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  create(@Body() createSkillDto: CreateSkillDto, @Req() req: AuthRequest) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновить навык',
    description:
      'Обновляет информацию о навыке. Доступно только владельцу навыка',
  })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiBody({ type: UpdateSkillDto })
  @ApiOkResponse({ description: 'Навык успешно обновлен', type: Skill })
  @ApiBadRequestResponse({ description: 'Неверные данные для обновления' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Нет прав на обновление навыка' })
  @ApiNotFoundResponse({ description: 'Навык не найден' })
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить навык',
    description: 'Удаляет навык. Доступно только владельцу навыка',
  })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiNoContentResponse({ description: 'Навык успешно удален' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Нет прав на удаление навыка' })
  @ApiNotFoundResponse({ description: 'Навык не найден' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.skillsService.remove(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Добавить навык в избранное',
    description: 'Добавляет навык в избранное текущего пользователя',
  })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiCreatedResponse({ description: 'Навык успешно добавлен в избранное' })
  @ApiBadRequestResponse({ description: 'Неверный формат UUID' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Навык не найден' })
  addToFavorite(
    @Param('id', ParseUUIDPipe) skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.addToFavorite(req.user.sub, skillId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить навык из избранного',
    description: 'Удаляет навык из избранного текущего пользователя',
  })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiNoContentResponse({ description: 'Навык успешно удален из избранного' })
  @ApiBadRequestResponse({ description: 'Неверный формат UUID' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Навык не найден в избранном' })
  removeFromFavorite(
    @Param('id', ParseUUIDPipe) skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.removeFromFavorite(req.user.sub, skillId);
  }
}
