import { DataSource } from "typeorm";
import { Student } from "../common/entities/student.entity";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "studentdb",
  synchronize: true, // chỉ bật khi dev, sẽ auto sync entity -> table
  logging: true,
  entities: [Student],
  migrations: [],
  subscribers: [],
});
