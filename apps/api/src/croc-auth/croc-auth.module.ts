import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaCrocModule } from '../prisma-croc/prisma-croc.module';
import { CrocAuthController } from './croc-auth.controller';
import { CrocAuthService } from './croc-auth.service';
import { CrocJwtStrategy } from './strategies/croc-jwt.strategy';

@Module({
  imports: [
    PrismaCrocModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
    }),
  ],
  controllers: [CrocAuthController],
  providers: [CrocAuthService, CrocJwtStrategy],
})
export class CrocAuthModule {}
