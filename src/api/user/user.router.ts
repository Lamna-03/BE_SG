import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, {Request, Response, Router} from "express";
import { z } from "zod";

import { GetUserSchema, UserSchema } from "./user.model";
import { UserService } from "./user.service";

export const userRegistry = new OpenAPIRegistry();
userRegistry.register('User', UserSchema);

const router = express.Router();

//Register OpenAPI paths
userRegistry.registerPath({
    method: "post",
    path: "/users",
    tags: ["Users"],
    request: {
        body: z.object({
            email: z.string().email(),
            password: z.string().min(6, "Password must be at least 6 characters long"),
            name: z.string().min(2, "Name must be at least 2 characters long"),
            avt_url: z.string().optional(),
        }),
    },
    responses: {
