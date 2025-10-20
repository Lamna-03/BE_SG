import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Board } from "./Board.entity";
import { Workspace_member } from "./Workspace_member.entity";
import { User } from "./User.entity";

@Entity()
export class Workspace {
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

  @ManyToOne(() => User)
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @OneToMany(
    () => Workspace_member,
    (workspace_member) => workspace_member.workspace
  )
  members!: Workspace_member[];

  @OneToMany(() => Board, (board) => board.workspace)
  boards!: Board[];
}
