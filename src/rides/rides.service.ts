import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { identity } from 'rxjs';
import { LoggerService } from 'src/common/logger/logger.service';
import { RideStatus } from 'src/constants';
import { BookRide, CancelRide, CreateRide, GetAllRides, GetRideById } from 'src/Dto/rides.dto';
import { ReddisService } from 'src/redis/redis.service';

@Injectable()
export class RidesService {

    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private redisService: ReddisService
    ) { }

    public async createRide(@Body() payload: CreateRide) {
        try {

            const redis = this.redisService.getClient();

            let createdRide = this.prisma.ride.create({
                data: {
                    pickupLocation: payload?.pickupLocation,
                    destination: payload?.destination,
                    driverId: payload?.userId,
                    price: payload?.price ?? 0,
                    seatsAvailable: payload?.seatsAvailable ?? -1
                }
            })

            await redis.del('All_rides')

            if (!createdRide) {
                throw new BadRequestException({
                    message: 'There was an error in creating the Ride'
                })
            }
            this.logger.log(`The ride was created by user: ${payload.userId}`)
            return createdRide
        } catch (error) {
            this.logger.error('Error in ride creation', error)
            throw new BadRequestException(error)
        }
    }

    public async getAllRides(@Body() payload: GetAllRides) {
        try {

            const redis = this.redisService.getClient()
            const cachedRides = await redis.get('All_rides')

            if(cachedRides) {
                this.logger.log(`Getting all the rides from redis cache`)
                return JSON.parse(cachedRides)
            }

            let rides = await this.prisma.ride.findMany({
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

            await redis.set('All_rides', JSON.stringify(rides), 'EX', 10)

            return rides ?? []
        } catch (err) {
            throw new BadRequestException({
                message: err
            })
        }
    }

    public async getRideById(@Body() payload: GetRideById) {
        try {
            const redis = this.redisService.getClient()
            const cacheKey = `ride_${payload.rideId}`

            let cachedRideById = await redis.get(cacheKey)

            if(cachedRideById) {
                return JSON.parse(cachedRideById ?? {})
            }

            let ride = this.prisma.ride.findUnique({
                where: {
                    id: payload.rideId
                },
                include: {
                    driver: true,
                    bookings: true
                }
            })

            await redis.set(cacheKey, JSON.stringify(ride), 'EX', 30)

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
            const redis = this.redisService.getClient()

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
                    message: `A driver with driver Id:${payload.userId} cannot book his own ride`
                })
            }

            if (ride.status === RideStatus.RideCancelled) {
                throw new BadRequestException({
                    message: `Ride ${ride.id} has been cancelled and cannot be booked`
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

            await redis.del('All_rides')
            await redis.del(`ride_${payload.rideId}`)

            return {
                bookRide
            }
        } catch (err) {
            this.logger.error(`Error in bookRide: ${err}`)
            throw new BadRequestException(err)
        }


    }

    public async cancelRide(@Body() payload: CancelRide) {
        try {

            const redis = this.redisService.getClient()

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

            await redis.del('All_rides')
            await redis.del(`ride_${payload.rideId}`)

            return updateRide;

        } catch (err) {
            this.logger.error(`The is an Error in cancel Ride: ${err}`)
            throw new BadRequestException(err)
        }

    }
}
