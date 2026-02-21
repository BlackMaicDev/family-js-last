import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY', // ต้องตรงกับใน AuthModule นะครับ
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