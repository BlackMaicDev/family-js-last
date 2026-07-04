import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaCrocService } from '../../prisma-croc/prisma-croc.service';

@Injectable()
export class CrocJwtStrategy extends PassportStrategy(Strategy, 'croc-jwt') {
  constructor(private readonly prismaCroc: PrismaCrocService) {
    super({
      // ดึง Token จาก Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // payload.sub คือ id ของ user ในตาราง User (prisma-croc)
    const user = await this.prismaCroc.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in CrocTrack database');
    }

    // คืนค่า userId กลับไปให้ decorator @GetUser('userId') ใช้งานได้
    return { userId: user.id, email: user.email };
  }
}
