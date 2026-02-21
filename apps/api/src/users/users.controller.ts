import { Controller, Get, Patch, Param, Body, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { deleteFileFromUrl } from '../utils/file.util';


@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard) // 🛡️ ล็อก 2 ชั้น: ต้อง Login และต้องเป็น Admin
export class UserManagementController {
    constructor(private prisma: PrismaService) { }

    // 🔍 ค้นหาและดูรายชื่อ User ทั้งหมด
    @Get()
    async findAll(@Query('search') search?: string, @Query('role') role?: Role) {
        return this.prisma.user.findMany({
            where: {
                AND: [
                    role ? { role } : {}, // กรองตาม Role
                    search ? {
                        OR: [
                            { username: { contains: search, mode: 'insensitive' } },
                            { nickname: { contains: search, mode: 'insensitive' } },
                        ],
                    } : {},
                ],
            },
            select: {
                id: true,
                username: true,
                nickname: true,
                role: true,
                isActive: true, //
                lastLogin: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // 🔑 เปลี่ยน Role (ADMIN/USER)
    @Patch(':id/role')
    async updateRole(@Param('id') id: string, @Body('role') role: Role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }

    // 🚫 ระงับการใช้งาน (Ban/Unban)
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive }, //
        });
    }

    // 🗑️ ลบ User (ระวังหน่อยนะครับ!)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userToDelete = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true }
        });

        const deletedUser = await this.prisma.user.delete({ where: { id } });

        if (userToDelete?.avatarUrl) {
            deleteFileFromUrl(userToDelete.avatarUrl);
        }
        if (userToDelete?.profile?.avatarUrl) {
            deleteFileFromUrl(userToDelete.profile.avatarUrl);
        }

        return deletedUser;
    }
}