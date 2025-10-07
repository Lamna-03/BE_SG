import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { List } from "./List.entity";
import { Comment } from "./Comment.entity";

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: "float", nullable: true })
    position_float!: number;

    @Column({ default: 0 })
    priority_mucdoutien!: number;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({ default: false })
    isActive!: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updatedAt!: Date;

    @ManyToOne(() => List, (list) => list.cards)
    list!: List;

    @OneToMany(() => Comment, (comment) => comment.card)
    comments!: Comment[];
}
