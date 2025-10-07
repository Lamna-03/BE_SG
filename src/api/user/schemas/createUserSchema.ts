import { extendZodWithOpenApi, ZodRequestBody } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CreateUserContentSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    avt_url: z.string().optional(),
});

export const PostUser: ZodRequestBody = {
    description: "Create a new user",
    content: {
        "application/json": {
            schema: CreateUserContentSchema,
        },
    },
};

export const PostUserSchema = z.object({
    body: CreateUserContentSchema,
});