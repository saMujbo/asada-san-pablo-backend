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
	cors: {
		origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
		credentials: true,
	},
})
export class NotificationsGateway implements OnGatewayConnection {
	@WebSocketServer()
	server!: Server;

	constructor(
		private readonly jwtService: JwtService,
		@Inject(forwardRef(() => NotificationService))
		private readonly notificationService: NotificationService,
	) {}

	async handleConnection(client: Socket) {
		const token = client.handshake.auth?.token;

		if (typeof token !== 'string' || token.trim().length === 0) {
			client.disconnect(true);
			return;
		}

		try {
			const payload = await this.jwtService.verifyAsync<{
				id: number;
				roles?: string[];
				role?: string;
			}>(token);
			const userId = payload?.id;

			if (!userId) {
				client.disconnect(true);
				return;
			}

			await client.join(this.getUserRoom(userId));
			if (this.isAdmin(payload)) {
				await client.join(this.getAdminsRoom());
			}

			const notifications =
				await this.notificationService.getNotificationsSummaryByUserId(userId);
			client.emit('notification.all', notifications);
		} catch {
			client.disconnect(true);
		}
	}

	emitAveriaAlert(payload: unknown) {
		this.server.to(this.getAdminsRoom()).emit('averia:nueva', payload);
	}

	emitGeneralNotification(type: string, payload: unknown) {
		this.server.emit(`notificacion:${type}`, payload);
	}

	emitUserNotification(userId: string, payload: unknown) {
		this.server
			.to(this.getUserRoom(userId))
			.emit('solicitud:resuelta', payload);
	}

	async emitNotificationsToUser(userId: number) {
		const payload =
			await this.notificationService.getNotificationsSummaryByUserId(userId);
		this.server.to(this.getUserRoom(userId)).emit('notification.all', payload);
	}

	emitReportCreated(payload: unknown) {
		this.emitAveriaAlert(payload);
	}

	private getUserRoom(userId: number | string) {
		return `user:${userId}`;
	}

	private getAdminsRoom() {
		return 'admins';
	}

	private isAdmin(payload: { roles?: string[]; role?: string }) {
		const roles = [
			...(Array.isArray(payload.roles) ? payload.roles : []),
			...(typeof payload.role === 'string' ? [payload.role] : []),
		];

		return roles.some((role) => role?.toLowerCase() === 'admin');
	}
}

export { NotificationsGateway as NotificationGateway };
