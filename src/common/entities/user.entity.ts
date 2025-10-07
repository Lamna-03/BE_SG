import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Workspace } from "./workspace.entity";
import { Comment } from "./Comment.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: number;

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

    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    workspaces!: Workspace[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments!: Comment[];
}
