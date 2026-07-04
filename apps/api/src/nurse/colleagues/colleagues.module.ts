import { Module } from '@nestjs/common';
import { ColleaguesController } from './colleagues.controller';
import { ColleaguesService } from './colleagues.service';
import { PrismaNurseModule } from '../../prisma-nurse/prisma-nurse.module';

@Module({
  imports: [PrismaNurseModule],
  controllers: [ColleaguesController],
  providers: [ColleaguesService]
})
export class ColleaguesModule {}
