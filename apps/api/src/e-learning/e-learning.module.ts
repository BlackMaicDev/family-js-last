import { Module } from '@nestjs/common';
import { ELearningService } from './e-learning.service';
import { ELearningController } from './e-learning.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ELearningController],
  providers: [ELearningService, PrismaService],
})
export class ELearningModule {}
