import "reflect-metadata";
import { DataSource } from "typeorm";
import app from "./app";
import { AppDataSource } from "./configs/typeorm.config";

const PORT = process.env.PORT || 3000;

// Kết nối DB rồi start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("DB connection failed ❌", err));
