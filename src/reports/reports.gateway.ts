import {
  WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody,
  ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/reports',
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class ReportsGateway {
  @WebSocketServer()
  server: Server;

  emitReportCreated(payload: { 
    Id: number; 
    Location: string; 
    Description: string;
    User: {
      Id: number;
      Name: string;
      Email: string;
      FullName: string;
    };
    CreatedAt: Date;
  }) {
    this.server.emit('report.created', payload);
  }
}
