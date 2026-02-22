import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExperiencesController } from './experiences.controller';

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesService, PrismaService],
})
export class ExperiencesModule { }
