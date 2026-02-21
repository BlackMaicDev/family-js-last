import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // เฉพาะ Admin สร้าง Category ได้
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    // ใครๆ ก็ดูรายชื่อ Category ได้
    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    // ใครๆ ก็ดู Category เดียว+รายชื่อบทความได้
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    // เฉพาะ Admin อัปเดต Category ได้
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    // เฉพาะ Admin ลบ Category ได้
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
