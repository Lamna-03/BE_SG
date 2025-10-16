import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Board } from "./Board.entity";
import { Card } from "./Card.entity";

@Entity()
export class List {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    title!: string;

    @Column()
    position!: number;

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

    @ManyToOne(() => Board, (board) => board.lists)
    board!: Board;

    @OneToMany(() => Card, (card) => card.list)
    cards!: Card[];
}