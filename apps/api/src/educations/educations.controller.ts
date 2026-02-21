import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EducationsService } from './educations.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('educations')
export class EducationsController {
    constructor(private readonly educationsService: EducationsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createEducationDto: CreateEducationDto, @Request() req) {
        return this.educationsService.create(createEducationDto, req.user.userId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.educationsService.findByUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.educationsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEducationDto: UpdateEducationDto, @Request() req) {
        return this.educationsService.update(id, updateEducationDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.educationsService.remove(id, req.user.userId, req.user.role);
    }
}
