import { Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { ReddisService } from 'src/redis/redis.service';
import { RedisModule } from 'src/redis/redis.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { RideGateway } from 'src/sockets/ride.gateway';
import { SocketsModule } from 'src/sockets/sockets.module';

@Module({
  controllers: [RidesController],
  providers: [RidesService],
  imports: [RedisModule, RabbitmqModule, SocketsModule]
})
export class RidesModule {}
