import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RidesService } from './rides.service';
import { BookRide, CancelRide, CreateRide, GetAllRides, GetRideById } from 'src/Dto/rides.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';


@UseGuards(JwtAuthGuard)
@Throttle( { default: {limit: 10,ttl: 60000} } )
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

    @Post('/getRideById')
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
