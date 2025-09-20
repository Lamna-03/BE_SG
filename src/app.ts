import express from "express";
import studentRouter from "./api/student/studentRouter"

const app = express();
app.use(express.json());
// Routes
app.use("/students", studentRouter);
export default app;
