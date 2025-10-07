import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as dotenv from "dotenv";

import { Board } from "../common/entities/Board.entity";
import { List } from "../common/entities/List.entity";
import { User } from "../common/entities/user.entity";
import { Workspace } from "../common/entities/workspace.entity";
import { Card } from "../common/entities/Card.entity";
import { Comment } from "../common/entities/Comment.entity";

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
  entities: [ User, Workspace, Board, List, Card, Comment],
  migrations: [],
  subscribers: [],
});
