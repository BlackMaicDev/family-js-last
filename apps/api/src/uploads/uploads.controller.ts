import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Multer } from 'multer';

@Controller('uploads')
export class UploadsController {
    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: any, @Body('folder') folder?: string) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const folderName = folder || 'misc';
        const url = `/public/uploads/${folderName}/${file.filename}`;
        return { url };
    }
}
