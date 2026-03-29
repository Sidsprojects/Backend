import { Injectable } from "@nestjs/common";
import Redis from 'ioredis';

@Injectable()
export class ReddisService {

    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT)
        });
    }

    getClient() {
        return this.client;
    }
}