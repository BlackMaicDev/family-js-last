import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateBulkScheduleDto } from './dto/create-schedule.dto';

@Controller('nurse/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  createBulk(@Body() createBulkDto: CreateBulkScheduleDto) {
    return this.schedulesService.createBulk(createBulkDto);
  }

  @Get()
  getCalendarView(
    @Query('wardId') wardId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.schedulesService.getCalendarView(wardId, parseInt(year), parseInt(month));
  }

  @Get('me')
  getMySchedule(
    @Query('nurseId') nurseId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.schedulesService.getMySchedule(nurseId, parseInt(year), parseInt(month));
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.schedulesService.publish(id);
  }
}
