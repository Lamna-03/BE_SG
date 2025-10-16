import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as dotenv from "dotenv";

import { Board } from "../common/entities/Board.entity";
import { List } from "../common/entities/List.entity";
import { User } from "../common/entities/User.entity";
import { Workspace } from "../common/entities/Workspace.entity";
import { Card } from "../common/entities/Card.entity";
import { Comment } from "../common/entities/Comment.entity";
import { Workspace_member } from "../common/entities/Workspace_member.entity";
import { Board_member } from "../common/entities/Board_member.entity";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "task_management_db",
  synchronize: true, // chỉ bật khi dev, sẽ auto sync entity -> table
  logging: true,
  entities: [
    User,
    Workspace,
    Board,
    List,
    Card,
    Comment,
    Board_member,
    Workspace_member,
  ],
  migrations: [],
  subscribers: [],
});
