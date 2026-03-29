import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RidesModule } from './rides/rides.module';
import { RedisModule } from './redis/redis.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { SocketsModule } from './sockets/sockets.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, UsersModule, RidesModule, RedisModule, RabbitmqModule, SocketsModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
