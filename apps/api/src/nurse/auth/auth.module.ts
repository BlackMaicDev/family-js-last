import { Module } from '@nestjs/common';
import { AuthNurseController } from './auth.controller';
import { AuthNurseService } from './auth.service';
import { PrismaNurseModule } from '../../prisma-nurse/prisma-nurse.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaNurseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
    })
  ],
  controllers: [AuthNurseController],
  providers: [AuthNurseService]
})
export class NurseAuthModule {}
