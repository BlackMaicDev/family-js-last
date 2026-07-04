import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Controller('nurse/leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leavesService.create(createLeaveDto);
  }

  @Get()
  findAll(
    @Query('nurseId') nurseId?: string,
    @Query('status') status?: string,
  ) {
    return this.leavesService.findAll(nurseId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.leavesService.approve(id, approvedBy);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('rejectReason') rejectReason?: string) {
    return this.leavesService.reject(id, rejectReason);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.leavesService.cancel(id);
  }
}
