import { Module } from '@nestjs/common';
import { UserManagementController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
    controllers: [UserManagementController],
    providers: [PrismaService, JwtStrategy], // 2. ใส่ PrismaService ลงในนี้
})
export class UsersModule { }
