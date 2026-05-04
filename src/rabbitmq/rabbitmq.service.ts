import { Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import * as amqp from 'amqplib';
import { LoggerService } from "src/common/logger/logger.service";

@Injectable()
export class RabbitMQService implements OnModuleInit {
    constructor(
        private readonly loggerService: LoggerService
    ) {}
    private channel: amqp.Channel;

    async onModuleInit() {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await connection.createChannel();
            await this.channel.assertQueue('ride_events')   
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Connection to RabbitMQ failed',
            })
        }
    }

    async publish(queue: string, message: any) {
        try {

            this.channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(message))
            )
            
        } catch (error) {
            this.loggerService.error('Error in publish')
            throw new InternalServerErrorException({
                message: `Error in publish: ${error}`
            })
        }

    }

    async consume(queue: string, callback: (msg: any) => void) {
        try {
            await this.channel.consume(
                queue, (msg) => {
                    if (msg) {
                        const data = JSON.parse(msg.content.toString())
                        callback(data ?? '')
                        this.channel.ack(msg ?? '')
                    }
                }
            )
        } catch (error) {
            this.loggerService.error(`Error in Consume`)
            throw new InternalServerErrorException({
                message: `Cannot consume error: ${error}`
            })
        }
    }

    // async sendToQueue(message: string) {
    //     this.channel.sendToQueue(
    //         'notifications',
    //         Buffer.from(message),
    //     );
    // }
}