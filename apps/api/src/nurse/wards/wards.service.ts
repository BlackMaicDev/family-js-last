import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateWardDto } from './dto/update-ward.dto';

@Injectable()
export class WardsService {
  constructor(private prisma: PrismaNurseService) {}

  async create(createWardDto: CreateWardDto) {
    return this.prisma.ward.create({
      data: createWardDto,
    });
  }

  async findAll() {
    return this.prisma.ward.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id },
    });
    if (!ward) throw new NotFoundException('Ward not found');
    return ward;
  }

  async update(id: string, updateWardDto: UpdateWardDto) {
    const ward = await this.findOne(id);
    return this.prisma.ward.update({
      where: { id: ward.id },
      data: updateWardDto,
    });
  }

  async remove(id: string) {
    const ward = await this.findOne(id);
    return this.prisma.ward.delete({
      where: { id: ward.id },
    });
  }
}
