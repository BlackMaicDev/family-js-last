import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaNurseService) {}

  async create(createLeaveDto: CreateLeaveDto) {
    const start = new Date(createLeaveDto.startDate);
    const end = new Date(createLeaveDto.endDate);

    if (end < start) {
      throw new BadRequestException('End date cannot be before start date');
    }

    // Calculate total days (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create the leave request
    const leave = await this.prisma.leaveRequest.create({
      data: {
        nurseId: createLeaveDto.nurseId,
        type: createLeaveDto.type,
        startDate: start,
        endDate: end,
        totalDays,
        reason: createLeaveDto.reason,
      },
      include: {
        nurse: true,
      },
    });

    // Automatically create a notification for the reminder 1 day before
    const reminderDate = new Date(start);
    reminderDate.setDate(reminderDate.getDate() - 1);

    await this.prisma.nurseNotification.create({
      data: {
        nurseId: leave.nurseId,
        type: 'LEAVE_REMINDER',
        title: 'แจ้งเตือน: วันลาพรุ่งนี้',
        body: `คุณมีการลา${this.getLeaveTypeName(leave.type)}ในวันพรุ่งนี้`,
        scheduledAt: reminderDate,
        metadata: {
          leaveId: leave.id,
          leaveType: leave.type,
          startDate: leave.startDate,
        },
      },
    });

    return leave;
  }

  async findAll(nurseId?: string, status?: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        ...(nurseId && { nurseId }),
        ...(status && { status: status as any }),
      },
      include: {
        nurse: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { nurse: true },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async approve(id: string, approvedBy: string) {
    const leave = await this.findOne(id);
    
    // Update the leave status
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // Notify the nurse
    await this.prisma.nurseNotification.create({
      data: {
        nurseId: leave.nurseId,
        type: 'LEAVE_STATUS',
        title: 'อนุมัติการลาแล้ว',
        body: `คำขอลา${this.getLeaveTypeName(leave.type)} ของคุณได้รับการอนุมัติแล้ว`,
        metadata: { leaveId: leave.id },
      },
    });

    return updatedLeave;
  }

  async reject(id: string, rejectReason?: string) {
    const leave = await this.findOne(id);
    
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectReason,
      },
    });

    // Notify the nurse
    await this.prisma.nurseNotification.create({
      data: {
        nurseId: leave.nurseId,
        type: 'LEAVE_STATUS',
        title: 'คำขอลาถูกปฏิเสธ',
        body: `คำขอลา${this.getLeaveTypeName(leave.type)} ของคุณไม่ได้รับการอนุมัติ`,
        metadata: { leaveId: leave.id },
      },
    });

    return updatedLeave;
  }

  async cancel(id: string) {
    const leave = await this.findOne(id);

    if (leave.status === 'APPROVED' || leave.status === 'REJECTED') {
      throw new BadRequestException('Cannot cancel a leave request that has already been processed');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  private getLeaveTypeName(type: string): string {
    const map = {
      SICK: 'ป่วย',
      ANNUAL: 'พักร้อน',
      PERSONAL: 'กิจ',
      MATERNITY: 'คลอด',
    };
    return map[type] || 'อื่นๆ';
  }
}
