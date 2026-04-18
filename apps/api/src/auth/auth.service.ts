import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService, // ต้อง Inject เพื่อใช้สร้าง Token
    ) { }

    async register(data: RegisterDto) {
        try {
            // 1. ตรวจสอบว่ามี User ซ้ำหรือไม่
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [{ email: data.email }, { username: data.username }],
                },
            });

            if (existingUser) {
                throw new ConflictException('Email or Username already exists');
            }

            // 2. เข้ารหัสรหัสผ่าน (Salting & Hashing)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            // 3. บันทึกข้อมูลลงตาราง users
            const newUser = await this.prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    password: hashedPassword,
                    nickname: data.nickname || data.username,
                    role: data.role || 'USER', // ใช้ role ที่ส่งมา หรือ default เป็น USER
                },
            });

            // 4. กรองรหัสผ่านออกก่อนส่งกลับ
            const { password, ...result } = newUser;
            return result;

        } catch (error) {
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Something went wrong during registration');
        }
    }

    // ฟังก์ชันกลางสำหรับสร้าง Token 2 ใบพร้อมกัน
    async generateTokens(userId: string, username: string, role: string) {
        const payload = { sub: userId, username, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m', secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET || 'MY_SUPER_REFRESH_SECRET' }),
        ]);

        // บันทึก Refresh Token ลง Database
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: userId,
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 วัน
            },
        });

        return { accessToken, refreshToken };
    }

    async login(identifier: string, pass: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });
        if (!user || !(await bcrypt.compare(pass, user.password!))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // อัปเดต Last Login
        await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

        // เรียกใช้ฟังก์ชันสร้าง Token
        const tokens = await this.generateTokens(user.id, user.username, user.role);

        return {
            ...tokens,
            user: { id: user.id, username: user.username, role: user.role, avatar: user.avatarUrl }
        };
    }

    async refresh(refreshToken: string) {
        // 1. เปลี่ยนจาก findUnique เป็น findFirst เพื่อป้องกัน Error ถ้ามี Token ซ้ำ
        const storedToken = await this.prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                isRevoked: false // เช็คด้วยว่าไม่ได้ถูกสั่งยกเลิก
            },
            include: { user: true },
        });

        // 2. ถ้าไม่เจอ หรือหมดอายุ
        if (!storedToken || storedToken.expiryDate < new Date()) {
            throw new UnauthorizedException('Refresh token invalid or expired');
        }

        // 🌟 3. เคลียร์ขยะ: ลบ Token "ทั้งหมด" ของ User คนนี้ออกก่อนสร้างใบใหม่ (เพื่อความสะอาดแบบในรูปแรก)
        await this.prisma.refreshToken.deleteMany({
            where: { userId: storedToken.userId }
        });

        // 4. สร้าง Token ชุดใหม่ (ใช้ generateTokens ที่เราทำไว้)
        return this.generateTokens(storedToken.user.id, storedToken.user.username, storedToken.user.role);
    }

    // ใน AuthService class
    async logout(userId: string) {
        // ลบทุก Token ที่เป็นของ User คนนี้
        await this.prisma.refreshToken.deleteMany({
            where: { userId: userId },
        });
        return { message: 'Logged out from all devices successfully' };
    }
}