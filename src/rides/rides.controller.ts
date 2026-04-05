import { Body, Controller, Post } from '@nestjs/common';
import { RidesService } from './rides.service';
import { BookRide, CancelRide, CreateRide, GetAllRides, GetRideById } from 'src/Dto/rides.dto';

@Controller('rides')
export class RidesController {

    constructor(
        private appService: RidesService
    ) {}

    @Post('/createRide')
    async createRide(@Body() payload: CreateRide) {
        return this.appService.createRide(payload ?? {})
    }

    @Post('/getAllRides')
    async getAllRides(@Body() payload: GetAllRides) {
        return this.appService.getAllRides(payload ?? {})
    }

    @Post('getSingleRide')
    async getRideById(@Body() payload: GetRideById) {
        return this.appService.getRideById(payload ?? {})
    }

    @Post('/bookRide')
    async bookRide(@Body() payload: BookRide) {
        return this.appService.bookRide(payload ?? {})
    }

    @Post('/cancelRide')
    async cancelRide(@Body() payload: CancelRide) {
        return this.appService.cancelRide(payload ?? {})
    }
}
