import { BadRequestException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { LoggerService } from 'src/common/logger/logger.service';

@WebSocketGateway({
    cors: true
})
export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private logger: LoggerService,
    ) { }

    @WebSocketServer()
    server: Server;


    handleConnection(client: Socket) {
        this.logger.log(`Client Connected : ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`)
    }


    @SubscribeMessage('join_ride')
    handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { rideId: number }) {

        const room = `ride_${data.rideId}`
        try {
            client.join(room)
            this.logger.log(`client id ${client.id} connected to room ${room}`)
        } catch (error) {
            throw new BadRequestException({
                message: `Error in joining room: ${room}`
            })
        }

    }

    @SubscribeMessage('update_location')
    handleLocation(
        @MessageBody()
        data: { rideId: number; lat: number; lng: number },
    ) {
        this.server.to(`ride_${data.rideId}`).emit('location_update', data);
    }
}

