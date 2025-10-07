import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from "typeorm";
import { User } from "./user.entity";
import {Board} from "./Board.entity";

@Entity()
export class Workspace {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

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

    @ManyToMany(() => User, (user) => user.workspaces)
    owner!: User;

    @OneToMany(() => Board, (board) => board.workspace)
    boards!: Board[];
}
