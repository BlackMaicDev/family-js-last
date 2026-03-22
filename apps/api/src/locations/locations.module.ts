import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationsGateway } from './locations.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [LocationsController],
    providers: [LocationsService, LocationsGateway, PrismaService],
    exports: [LocationsService],
})
export class LocationsModule { }
