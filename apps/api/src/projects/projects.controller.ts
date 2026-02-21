import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
        return this.projectsService.create(createProjectDto, req.user.userId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.projectsService.findByUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
        return this.projectsService.update(id, updateProjectDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.projectsService.remove(id, req.user.userId, req.user.role);
    }
}
