import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ColleaguesService } from './colleagues.service';
import { CreateColleagueDto } from './dto/create-colleague.dto';
import { UpdateColleagueDto } from './dto/update-colleague.dto';

@Controller('nurse/colleagues')
export class ColleaguesController {
  constructor(private readonly colleaguesService: ColleaguesService) {}

  @Post()
  create(@Body() createColleagueDto: CreateColleagueDto) {
    return this.colleaguesService.create(createColleagueDto);
  }

  @Get()
  findAll(@Query('nurseId') nurseId: string) {
    return this.colleaguesService.findAll(nurseId);
  }

  @Get('compare')
  compareSchedules(
    @Query('myNurseId') myNurseId: string,
    @Query('colleagueId') colleagueId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.colleaguesService.compareSchedules(myNurseId, colleagueId, parseInt(year), parseInt(month));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColleagueDto: UpdateColleagueDto) {
    return this.colleaguesService.update(id, updateColleagueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colleaguesService.remove(id);
  }
}
