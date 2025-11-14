import {
  WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody,
  ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/reports',
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'https://redsanpbalo-frontend-abonados.vercel.app',
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
    ReportLocation: {
      Id: number;
      Neighborhood: string;
    } | null;
    ReportType: {
      Id: number;
      Name: string;
    };
    CreatedAt: Date;
    ReportState: {
      Id: number;
      Name: string;
    } | null;
    UserInCharge: {
      Id: number;
      Name: string;
      Email: string;
      FullName: string;
    } | null;
  }) {
    this.server.emit('report.created', payload);
  }
}
