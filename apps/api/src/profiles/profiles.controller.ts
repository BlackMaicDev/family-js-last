import { Controller, Get, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    // ใครๆ ก็ดู Profile ของคนอื่นได้โดยผ่าน userId
    @Get(':userId')
    findOne(@Param('userId') userId: string) {
        return this.profilesService.findOne(userId);
    }

    // แก้ไขหรือสร้าง Profile ของตัวเอง (Upsert)
    @UseGuards(JwtAuthGuard)
    @Put('me')
    upsert(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
        return this.profilesService.upsert(req.user.userId, updateProfileDto);
    }
}
