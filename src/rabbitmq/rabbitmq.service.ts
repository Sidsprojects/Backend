import { Injectable, OnModuleInit } from "@nestjs/common";
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
    private channel;

    async onModuleInit() {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        this.channel = await connection.createChannel();
        await this.channel.assertQueue('notifications')
    }

    async sendToQueue(message: string) {
        this.channel.sendToQueue(
            'notifications',
            Buffer.from(message),
        );

    }
}