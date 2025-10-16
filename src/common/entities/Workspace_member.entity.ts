import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Workspace } from "./Workspace.entity";

@Entity()
export class Workspace_member {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.workspaces_member)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, {onDelete: 'CASCADE'})
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column({ type: 'enum', enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'], default: 'MEMBER' })
  role!: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}
