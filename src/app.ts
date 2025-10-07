import express from "express";
import { authRouter } from "./api/auth/authRouter";
import { userRouter } from "./api/user/user.router";
import { openAPIRouter } from "./api-docs/openAPIRouter";
const app = express();
app.use(express.json());
// Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/api-docs", openAPIRouter);
export default app;
