import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('interests')
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createInterestDto: CreateInterestDto, @Request() req) {
        return this.interestsService.create(createInterestDto, req.user.userId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.interestsService.findByUser(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.interestsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInterestDto: UpdateInterestDto, @Request() req) {
        return this.interestsService.update(id, updateInterestDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.interestsService.remove(id, req.user.userId, req.user.role);
    }
}
