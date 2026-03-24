import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Notification } from "../entities/notification.entity";

@Entity()
export class UserNotification {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({type:"int", nullable: false})
    User_id: number;

    @Column({type:"int", nullable: false})
    Notification_id: number;

    @Column({type:"boolean", default: false})
    Is_Read: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    CreatedAt: Date;

    @ManyToOne(() => User, (user) => user.UserNotifications)
    @JoinColumn({ name: "User_id" })
    User: User;

    @ManyToOne(() => Notification, (notification) => notification.UserNotifications)
    @JoinColumn({ name: "Notification_id" })
    Notification: Notification;
}

