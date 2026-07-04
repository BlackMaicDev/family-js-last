import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { CreateBulkScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaNurseService) {}

  async createBulk(dto: CreateBulkScheduleDto) {
    // Check if schedule already exists for this ward, year, month
    let schedule = await this.prisma.schedule.findUnique({
      where: {
        wardId_year_month: {
          wardId: dto.wardId,
          year: dto.year,
          month: dto.month,
        },
      },
    });

    if (!schedule) {
      schedule = await this.prisma.schedule.create({
        data: {
          wardId: dto.wardId,
          year: dto.year,
          month: dto.month,
          note: dto.note,
        },
      });
    }

    // Delete existing entries for this schedule to replace them (or we can upsert)
    await this.prisma.scheduleEntry.deleteMany({
      where: { scheduleId: schedule.id },
    });

    // Create new entries
    const entriesData = dto.entries.map((entry) => ({
      scheduleId: schedule.id,
      nurseId: entry.nurseId,
      date: new Date(entry.date),
      type: entry.type,
      shiftTypeId: entry.shiftTypeId,
      note: entry.note,
    }));

    await this.prisma.scheduleEntry.createMany({
      data: entriesData,
    });

    return this.prisma.schedule.findUnique({
      where: { id: schedule.id },
      include: {
        _count: {
          select: { entries: true },
        },
        ward: true,
      },
    });
  }

  async getCalendarView(wardId: string, year: number, month: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: {
        wardId_year_month: { wardId, year, month },
      },
      include: {
        ward: true,
      },
    });

    if (!schedule) throw new NotFoundException('Schedule not found for this month');

    // Fetch nurses and their entries
    const nurses = await this.prisma.nurseProfile.findMany({
      where: { wardId },
      include: {
        entries: {
          where: { scheduleId: schedule.id },
          include: { shiftType: true },
          orderBy: { date: 'asc' },
        },
      },
    });

    // Format response
    const formattedNurses = nurses.map((nurse) => {
      let totalShifts = 0;
      let totalOff = 0;
      let totalLeave = 0;

      const shifts = nurse.entries.map((entry) => {
        if (entry.type === 'SHIFT') totalShifts++;
        if (entry.type === 'OFF') totalOff++;
        if (entry.type === 'LEAVE') totalLeave++;

        return {
          date: entry.date,
          type: entry.type,
          shift: entry.shiftType,
        };
      });

      return {
        nurseId: nurse.id,
        employeeId: nurse.employeeId,
        fullName: `${nurse.firstName} ${nurse.lastName}`,
        position: nurse.position,
        shifts,
        summary: { totalShifts, totalOff, totalLeave },
      };
    });

    return {
      scheduleId: schedule.id,
      ward: schedule.ward,
      year: schedule.year,
      month: schedule.month,
      isPublished: schedule.isPublished,
      nurses: formattedNurses,
    };
  }

  async getMySchedule(nurseId: string, year: number, month: number) {
    const nurse = await this.prisma.nurseProfile.findUnique({
      where: { id: nurseId },
      include: { ward: true },
    });

    if (!nurse) throw new NotFoundException('Nurse not found');

    const schedule = await this.prisma.schedule.findUnique({
      where: {
        wardId_year_month: { wardId: nurse.wardId, year, month },
      },
    });

    if (!schedule || !schedule.isPublished) {
      throw new NotFoundException('Schedule not published yet');
    }

    const entries = await this.prisma.scheduleEntry.findMany({
      where: {
        scheduleId: schedule.id,
        nurseId,
      },
      include: {
        shiftType: true,
      },
      orderBy: { date: 'asc' },
    });

    return {
      nurse: {
        id: nurse.id,
        fullName: `${nurse.firstName} ${nurse.lastName}`,
        position: nurse.position,
        ward: nurse.ward,
      },
      year,
      month,
      shifts: entries.map((entry) => ({
        date: entry.date,
        type: entry.type,
        shift: entry.shiftType,
      })),
    };
  }

  async publish(id: string) {
    return this.prisma.schedule.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }
}
