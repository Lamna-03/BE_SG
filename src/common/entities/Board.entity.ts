import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Workspace } from "./Workspace.entity";
import { List } from "./List.entity";
import { Board_member } from "./Board_member.entity";

@Entity()
export class Board {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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

  @OneToMany(() => Board_member, (board_member) => board_member.board)
  members!: Board_member[];

  @ManyToOne(() => Workspace, (workspace) => workspace.boards,{onDelete: 'CASCADE'})
  workspace!: Workspace;

  @OneToMany(() => List, (list) => list.board)
  lists!: List[];
}
