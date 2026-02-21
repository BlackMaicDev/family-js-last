import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      global: true, // ทำให้เรียกใช้ได้ทุกที่โดยไม่ต้อง import ซ้ำ
      secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY', // แนะนำให้ย้ายไปไว้ใน .env ภายหลัง
      signOptions: { expiresIn: '1d' }, // อายุ Token 1 วัน
    }),
    PassportModule
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy], // ต้องใส่ PrismaService ที่นี่เพื่อให้เรียกใช้ได้
})
export class AuthModule { }