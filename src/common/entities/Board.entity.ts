import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Workspace } from "./workspace.entity";
import { List } from "./List.entity";

@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({ default: false})
    isActive!: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updatedAt!: Date;

    @ManyToOne(() => Workspace, (workspace) => workspace.boards)
    workspace!: Workspace;

    @OneToMany(() => List, (list) => list.board)
    lists!: List[];
}
