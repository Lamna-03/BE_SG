import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Workspace } from "./Workspace.entity";
import { Comment } from "./Comment.entity";
import { Workspace_member } from "./Workspace_member.entity";
import { Board_member } from "./Board_member.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  avt_url!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ default: "user" })
  status!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  @OneToMany(() => Board_member, (board_member) => board_member.user)
  board_members!: Board_member[];

  @OneToMany(
    () => Workspace_member,
    (workspace_member) => workspace_member.user
  )
  workspaces_member!: Workspace_member[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];
}
