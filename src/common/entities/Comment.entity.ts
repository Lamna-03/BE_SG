import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Card } from "./Card.entity";
import { User } from "./user.entity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @Column({ nullable: true })
    parentId?: number;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({ default: false })
    isActive!: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @ManyToOne(() => Card, (card) => card.comments)
    card!: Card;

    @ManyToOne(() => User, (user) => user.comments)
    user!: User;
}