import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PrismaNurseModule } from '../../prisma-nurse/prisma-nurse.module';

@Module({
  imports: [PrismaNurseModule],
  controllers: [ProfilesController],
  providers: [ProfilesService]
})
export class NurseProfilesModule {}
