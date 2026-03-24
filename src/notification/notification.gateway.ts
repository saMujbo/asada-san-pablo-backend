import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';
import { NotificationService } from './notification.service';

export interface NotificationSummaryPayload {
	Id: number;
	Subject: string;
	Message: string;
	Hour: string;
	CreatedAt: Date;
}

@WebSocketGateway({
	namespace: '/notification',
	cors: {
		origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
		credentials: true,
	},
})
export class NotificationGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	constructor(
		@Inject(forwardRef(() => NotificationService))
		private readonly notificationService: NotificationService,
	) {}

	async handleConnection(client: Socket) {
		const payload = await this.notificationService.getNotificationsSummary();
		client.emit('notification.all', payload);
	}

	emitAllNotifications(payload: NotificationSummaryPayload[]) {
		this.server.emit('notification.all', payload);
	}
}
