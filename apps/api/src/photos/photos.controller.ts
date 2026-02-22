import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('photos')
export class PhotosController {
    constructor(private readonly photosService: PhotosService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createPhotoDto: CreatePhotoDto, @Request() req) {
        return this.photosService.create(createPhotoDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/all')
    findAllAdmin() {
        return this.photosService.findAllAdmin();
    }

    @Get()
    findAll() {
        return this.photosService.findAll();
    }

    @Get('album/:albumId')
    findByAlbum(@Param('albumId') albumId: string) {
        return this.photosService.findByAlbum(albumId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.photosService.findByUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.photosService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePhotoDto: UpdatePhotoDto, @Request() req) {
        return this.photosService.update(id, updatePhotoDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.photosService.remove(id, req.user.userId, req.user.role);
    }
}
