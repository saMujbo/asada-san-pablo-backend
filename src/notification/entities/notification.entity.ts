import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserNotification } from "../user_notifications/user_notifications.entity";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    Subject: string;

    @Column({ type: 'text', nullable: false })
    Message: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    CreatedAt: Date;

    @OneToMany(() => UserNotification, userNotification => userNotification.Notification)
    UserNotifications: UserNotification[];
}
