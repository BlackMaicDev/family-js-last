import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaNurseService) {}

  async create(createProfileDto: CreateProfileDto) {
    return this.prisma.nurseProfile.create({
      data: createProfileDto,
      include: { ward: true },
    });
  }

  async findAll(wardId?: string) {
    return this.prisma.nurseProfile.findMany({
      where: wardId ? { wardId } : undefined,
      include: { ward: true },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.nurseProfile.findUnique({
      where: { id },
      include: { ward: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(id);
    return this.prisma.nurseProfile.update({
      where: { id: profile.id },
      data: updateProfileDto,
      include: { ward: true },
    });
  }

  async remove(id: string) {
    const profile = await this.findOne(id);
    
    // Hard delete: Delete schedule entries first to avoid foreign key constraints
    await this.prisma.scheduleEntry.deleteMany({
      where: { nurseId: profile.id },
    });
    
    // Then delete the profile itself
    return this.prisma.nurseProfile.delete({
      where: { id: profile.id },
    });
  }
}
