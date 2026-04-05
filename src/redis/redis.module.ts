import { Module } from '@nestjs/common';
import { ReddisService } from './redis.service';

@Module({
    providers: [ReddisService],
    exports: [ReddisService]
})
export class RedisModule {}
