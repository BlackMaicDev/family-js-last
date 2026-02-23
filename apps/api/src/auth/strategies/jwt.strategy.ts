import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            // 🍪 ดึง Token จาก HttpOnly Cookie ชื่อ 'access_token' แทนการใช้ Bearer Header
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.['access_token'] ?? null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
            passReqToCallback: false,
        });
    }

    async validate(payload: any) {
        // ข้อมูลที่ return ตรงนี้จะไปอยู่ใน request.user
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        // ถ้าไม่เจอ User หรือโดนสั่งระงับ (isActive: false) ให้ดีดออกทันที
        if (!user || !user.isActive) {
            throw new UnauthorizedException('บัญชีของคุณไม่ได้รับอนุญาตให้เข้าใช้งาน');
        }
        return { userId: payload.sub, username: payload.username, role: payload.role };
    }
}