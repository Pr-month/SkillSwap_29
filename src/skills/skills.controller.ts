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
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { AuthRequest } from '../auth/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSkillDto: CreateSkillDto, @Req() req: AuthRequest) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.skillsService.remove(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  addToFavorite(
    @Param('id', ParseUUIDPipe) skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.addToFavorite(req.user.sub, skillId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  removeFromFavorite(
    @Param('id', ParseUUIDPipe) skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.removeFromFavorite(req.user.sub, skillId);
  }
}
