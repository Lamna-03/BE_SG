import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm";

import { User } from "./User.entity";
import { Board } from "./Board.entity";

@Entity()
export class Board_member {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.board_members)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Board, (board) => board.members)
  @JoinColumn({ name: "board_id" })
  board!: Board;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  joinedAt!: Date;
}
