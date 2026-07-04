import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';

@Injectable()
export class ShiftTypesService {
  constructor(private prisma: PrismaNurseService) {}

  async create(createShiftTypeDto: CreateShiftTypeDto) {
    return this.prisma.shiftType.create({
      data: createShiftTypeDto,
    });
  }

  async findAll() {
    return this.prisma.shiftType.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const shiftType = await this.prisma.shiftType.findUnique({
      where: { id },
    });
    if (!shiftType) throw new NotFoundException('ShiftType not found');
    return shiftType;
  }

  async update(id: string, updateShiftTypeDto: UpdateShiftTypeDto) {
    const shiftType = await this.findOne(id);
    return this.prisma.shiftType.update({
      where: { id: shiftType.id },
      data: updateShiftTypeDto,
    });
  }

  async remove(id: string) {
    const shiftType = await this.findOne(id);
    return this.prisma.shiftType.delete({
      where: { id: shiftType.id },
    });
  }
}
