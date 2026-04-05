import { Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { ReddisService } from 'src/redis/redis.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [RidesController],
  providers: [RidesService],
  imports: [RedisModule]
})
export class RidesModule {}
