import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtService } from '@nestjs/jwt';

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
		private readonly jwtService: JwtService,
		@Inject(forwardRef(() => NotificationService))
		private readonly notificationService: NotificationService,
	) {}

	async handleConnection(client: Socket) {
		const token = this.extractToken(client);

		if (!token) {
			client.disconnect(true);
			return;
		}

		try {
			const payload = await this.jwtService.verifyAsync<{ id: number }>(token);
			const userId = payload?.id;

			if (!userId) {
				client.disconnect(true);
				return;
			}

			await client.join(this.getUserRoom(userId));

			const notifications =
				await this.notificationService.getNotificationsSummaryByUserId(userId);
			client.emit('notification.all', notifications);
		} catch {
			client.disconnect(true);
		}
	}

	async emitNotificationsToUser(userId: number) {
		const payload =
			await this.notificationService.getNotificationsSummaryByUserId(userId);
		this.server.to(this.getUserRoom(userId)).emit('notification.all', payload);
	}

	private getUserRoom(userId: number) {
		return `user:${userId}`;
	}

	private extractToken(client: Socket) {
		const authToken = client.handshake.auth?.token;
		if (typeof authToken === 'string' && authToken.trim().length > 0) {
			return authToken;
		}

		const authorizationHeader = client.handshake.headers.authorization;
		if (typeof authorizationHeader === 'string') {
			const [scheme, token] = authorizationHeader.split(' ');
			if (scheme?.toLowerCase() === 'bearer' && token) {
				return token;
			}
		}

		const queryToken = client.handshake.query?.token;
		if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
			return queryToken;
		}

		return null;
	}
}
