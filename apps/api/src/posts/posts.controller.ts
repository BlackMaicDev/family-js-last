import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard) // ต้อง Login ก่อนถึงจะสร้างโพสต์ได้
    @Post()
    create(@Body() createPostDto: CreatePostDto, @Request() req) {
        // req.user.userId ได้มาจาก JwtStrategy ที่เรา return ไว้
        return this.postsService.create(createPostDto, req.user.userId);
    }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard) // ต้อง Login ก่อน
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
        return this.postsService.update(id, updatePostDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard) // ต้อง Login ก่อน
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.postsService.remove(id, req.user.userId, req.user.role);
    }
}
