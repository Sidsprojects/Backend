import { Injectable, OnModuleInit } from "@nestjs/common";
import { RabbitMQService } from "./rabbitmq.service";
import { LoggerService } from "src/common/logger/logger.service";


@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    constructor(
        private rmqService: RabbitMQService,
        private loggerService: LoggerService
    ) { }

    onModuleInit() {
        this.rmqService.consume(
            'ride_events',
            (data) => {
                if (data.type == 'RIDE_BOOKED') {

                    this.loggerService.log(`Processing ride booking data for Ride id: ${data.rideId}`)

                    console.log('sending notification...')

                }else if(data.type == 'RIDE_CANCEL') {

                    this.loggerService.log(`Processing ride cancelling data for Ride id: ${data.rideId}`)

                    console.log('sending notification...')
                
                }
            }
        )


    }
}