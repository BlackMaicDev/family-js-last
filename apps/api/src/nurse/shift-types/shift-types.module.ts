import { Module } from '@nestjs/common';
import { ShiftTypesController } from './shift-types.controller';
import { ShiftTypesService } from './shift-types.service';
import { PrismaNurseModule } from '../../prisma-nurse/prisma-nurse.module';

@Module({
  imports: [PrismaNurseModule],
  controllers: [ShiftTypesController],
  providers: [ShiftTypesService]
})
export class ShiftTypesModule {}
