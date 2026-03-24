import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export interface NotificationSummaryPayload {
	Subject: string;
	Hour: string;
}

@WebSocketGateway({
	namespace: '/notification',
	cors: {
		origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
		credentials: true,
	},
})
export class NotificationGateway {
	@WebSocketServer()
	server: Server;

	emitAllNotifications(payload: NotificationSummaryPayload[]) {
		this.server.emit('notification.all', payload);
	}
}
