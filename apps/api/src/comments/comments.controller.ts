import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @UseGuards(JwtAuthGuard) // ต้อง Login ก่อนถึงจะคอมเมนต์ได้
    @Post()
    create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        return this.commentsService.create(createCommentDto, req.user.userId);
    }

    // ดูคอมเมนต์ทั้งหมดของโพสต์
    @Get('post/:postId')
    findByPost(@Param('postId') postId: string) {
        return this.commentsService.findByPost(postId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.commentsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard) // ต้อง Login ก่อน
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req) {
        return this.commentsService.update(id, updateCommentDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard) // ต้อง Login ก่อน
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.commentsService.remove(id, req.user.userId, req.user.role);
    }
}
