import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { identity } from 'rxjs';
import { LoggerService } from 'src/common/logger/logger.service';
import { RideStatus } from 'src/constants';
import { BookRide, CancelRide, CreateRide, GetAllRides, GetRideById } from 'src/Dto/rides.dto';

@Injectable()
export class RidesService {

    constructor(
        private prisma: PrismaService,
        private logger: LoggerService
    ) { }

    public async createRide(@Body() payload: CreateRide) {
        try {
            let createdRide = this.prisma.ride.create({
                data: {
                    pickupLocation: payload?.pickupLocation,
                    destination: payload?.destination,
                    driverId: userId,
                    price: payload?.price ?? 0,
                    seatsAvailable: payload?.seatsAvailable ?? -1
                }
            })
            this.logger.log(`The ride was created by user: ${userId}`)
            return createdRide
        } catch (error) {
            this.logger.error('Error in ride creation', error)
            throw new BadRequestException({
                message: `Error during ride creation: ${error}`
            })
        }
    }

    public async getAllRides(@Body() payload: GetAllRides) {
        try {
            let rides = this.prisma.ride.findMany({
                include: {
                    driver: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })

            return rides ?? []
        } catch (err) {
            throw new BadRequestException({
                message: err
            })
        }
    }

    public async getRideById(@Body() payload: GetRideById) {
        try {
            let ride = this.prisma.ride.findUnique({
                where: {
                    id: payload.rideId
                },
                include: {
                    driver: true,
                    bookings: true
                }
            })

            if (!ride) {
                throw new BadRequestException({
                    message: 'Ride was not found'
                })
            }

            return ride
        } catch (err) {
            this.logger.error(`Error in getRideByID: ${err}`)
            throw new BadRequestException({
                message: `Error in getting ride ${err}`
            })
        }
    }

    public async bookRide(@Body() payload: BookRide) {
        try {
            let ride = await this.prisma.ride.findUnique({
                where: {
                    id: payload.rideId
                }
            })

            if (!ride) {
                throw new BadRequestException({
                    message: 'Ride not found for booking'
                })
            }

            if (ride.seatsAvailable <= 0) {
                throw new BadRequestException({
                    message: `Seats are not available for ride: ${ride.id}`
                })
            }

            if (ride.driverId == payload.userId) {
                throw new BadRequestException({
                    message: `A driver:${payload.userId} cannot book his own ride`
                })
            }

            let existingBooking = await this.prisma.rideBooking.findFirst({
                where: {
                    rideId: payload?.rideId,
                    passengerId: payload?.userId
                }
            })

            if (existingBooking) {
                throw new BadRequestException({
                    message: `The booking: ${existingBooking.id} already exists for user: ${payload.userId} with ride id: ${payload.rideId}`
                })
            }

            await this.prisma.ride.update({
                where: { id: payload.rideId },
                data: {
                    seatsAvailable: {
                        decrement: 1
                    }
                }
            })

            let bookRide = await this.prisma.rideBooking.create({
                data: {
                    rideId: payload.rideId,
                    passengerId: payload.userId
                }
            })

            return {
                bookRide
            }
        } catch (err) {
            this.logger.error(`Error in bookRide: ${err}`)
        }


    }

    public async cancelRide(@Body() payload: CancelRide) {
        try {
            let ride = await this.prisma.ride.findUnique({
                where: {
                    id: payload.rideId
                }
            })

            if (!ride) {
                throw new BadRequestException({
                    message: `The ride doesnt exists with ride Id: ${payload.rideId}`
                })
            }

            if (ride.driverId !== payload.userId) {
                throw new BadRequestException({
                    message: `Only the driver of the ride can cancel the ride`
                })
            }

            const updateRide = await this.prisma.ride.update({
                where: { id: payload.rideId },
                data: {
                    status: RideStatus.RideCancelled
                }
            })

            this.logger.warn(`Ride ${payload.rideId} cancelled by user ${payload.userId}`);

            return updateRide;

        } catch (err) {
            this.logger.error(`The is an Error in cancel Ride: ${err}`)
        }

    }
}
