import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('albums')
export class AlbumsController {
    constructor(private readonly albumsService: AlbumsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createAlbumDto: CreateAlbumDto, @Request() req) {
        return this.albumsService.create(createAlbumDto, req.user.userId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.albumsService.findByUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.albumsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto, @Request() req) {
        return this.albumsService.update(id, updateAlbumDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.albumsService.remove(id, req.user.userId, req.user.role);
    }
}
