import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { UpdateColleagueDto } from './dto/update-colleague.dto';

@Injectable()
export class ColleaguesService {
  constructor(private prisma: PrismaNurseService) {}

  async create(createDto: CreateColleagueDto) {
    if (createDto.followerId === createDto.followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const exists = await this.prisma.colleagueLink.findUnique({
      where: {
        followerId_followingId: {
          followerId: createDto.followerId,
          followingId: createDto.followingId,
        },
      },
    });

    if (exists) {
      throw new BadRequestException('Already following this colleague');
    }

    return this.prisma.colleagueLink.create({
      data: createDto,
      include: {
        following: {
          include: { ward: true },
        },
      },
    });
  }

  async findAll(nurseId: string) {
    const links = await this.prisma.colleagueLink.findMany({
      where: { followerId: nurseId },
      include: {
        following: {
          include: { ward: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: links.length,
      colleagues: links.map(link => ({
        linkId: link.id,
        nickname: link.nickname,
        nurse: link.following,
        addedAt: link.createdAt,
      })),
    };
  }

  async update(id: string, updateDto: UpdateColleagueDto) {
    return this.prisma.colleagueLink.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    return this.prisma.colleagueLink.delete({
      where: { id },
    });
  }

  async compareSchedules(myNurseId: string, colleagueId: string, year: number, month: number) {
    // 1. Verify link exists
    const link = await this.prisma.colleagueLink.findFirst({
      where: {
        followerId: myNurseId,
        followingId: colleagueId,
      },
    });

    if (!link) {
      throw new BadRequestException('You must add this colleague first to view their schedule');
    }

    // 2. Fetch both profiles
    const [me, colleague] = await Promise.all([
      this.prisma.nurseProfile.findUnique({ where: { id: myNurseId }, include: { ward: true } }),
      this.prisma.nurseProfile.findUnique({ where: { id: colleagueId }, include: { ward: true } }),
    ]);

    if (!me || !colleague) throw new NotFoundException('Nurse profiles not found');

    // 3. Fetch schedules for both
    const mySchedule = await this.prisma.schedule.findUnique({
      where: { wardId_year_month: { wardId: me.wardId, year, month } }
    });

    const colleagueSchedule = await this.prisma.schedule.findUnique({
      where: { wardId_year_month: { wardId: colleague.wardId, year, month } }
    });

    // 4. Fetch entries
    const myEntries = mySchedule 
      ? await this.prisma.scheduleEntry.findMany({ where: { scheduleId: mySchedule.id, nurseId: myNurseId }, include: { shiftType: true } })
      : [];
      
    const colleagueEntries = colleagueSchedule
      ? await this.prisma.scheduleEntry.findMany({ where: { scheduleId: colleagueSchedule.id, nurseId: colleagueId }, include: { shiftType: true } })
      : [];

    // 5. Compare day by day
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: any[] = [];
    let swappableDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);
      
      const myShift = myEntries.find(e => e.date.getTime() === dateObj.getTime()) || { type: 'OFF', shiftType: null };
      const colShift = colleagueEntries.find(e => e.date.getTime() === dateObj.getTime()) || { type: 'OFF', shiftType: null };

      // Logic: Swappable if one is OFF and one is SHIFT, OR both are SHIFT but different shift types
      let swappable = false;
      if (myShift.type === 'OFF' && colShift.type === 'SHIFT') swappable = true;
      if (myShift.type === 'SHIFT' && colShift.type === 'OFF') swappable = true;
      if (myShift.type === 'SHIFT' && colShift.type === 'SHIFT' && myShift.shiftTypeId !== colShift.shiftTypeId) swappable = true;

      if (swappable) swappableDays++;

      days.push({
        date: dateStr,
        dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        myShift: {
          type: myShift.type,
          shift: myShift.shiftType,
        },
        colleagueShift: {
          type: colShift.type,
          shift: colShift.shiftType,
        },
        swappable,
      });
    }

    return {
      year,
      month,
      me: {
        nurseId: me.id,
        fullName: `${me.firstName} ${me.lastName}`,
        ward: me.ward,
      },
      colleague: {
        nurseId: colleague.id,
        fullName: `${colleague.firstName} ${colleague.lastName}`,
        nickname: link.nickname,
        ward: colleague.ward,
      },
      days,
      swappableDays,
    };
  }
}
