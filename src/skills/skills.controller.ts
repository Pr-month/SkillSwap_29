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
import { ApiTags } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { AuthRequest } from '@/auth/types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  ApiAddSkillToUser,
  ApiCreateSkill,
  ApiDeleteSkill,
  ApiGetAllSkills,
  ApiGetSkill,
  ApiRemoveSkillFromUser,
  ApiUpdateSkill,
} from './skills.swagger';

@ApiTags('Навыки')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiGetAllSkills()
  async findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @ApiGetSkill()
  async findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreateSkill()
  create(@Body() createSkillDto: CreateSkillDto, @Req() req: AuthRequest) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateSkill()
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
  @ApiDeleteSkill()
  async remove(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    await this.skillsService.remove(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/skills/:id')
  @ApiAddSkillToUser()
  addToFavorite(
    @Param('id', ParseUUIDPipe) skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.addToFavorite(req.user.sub, skillId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/skills/:id')
  @ApiRemoveSkillFromUser()
  removeFromFavorite(
    @Param('id', ParseUUIDPipe) skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.removeFromFavorite(req.user.sub, skillId);
  }
}
