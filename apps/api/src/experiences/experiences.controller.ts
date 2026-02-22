import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createExperienceDto: CreateExperienceDto, @Request() req) {
    return this.experiencesService.create(createExperienceDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.experiencesService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.experiencesService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExperienceDto: UpdateExperienceDto, @Request() req) {
    return this.experiencesService.update(id, updateExperienceDto, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.experiencesService.remove(id, req.user.userId, req.user.role);
  }
}
