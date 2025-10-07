import { extendZodWithOpenApi, ZodRequestBody } from "@asteasolutions/zod-to-openapi";
import { access } from "fs";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Token = z.infer<typeof TokenSchema>;

export const TokenSchema = z.object({
    accessToken: z.string(),
        refreshToken: z.string(),
    expiresIn: z.union([z.string(), z.number()]),
    tokenType: z.string(),
})

export type Login = z.infer<typeof LoginSchema>;
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
})

export const PostLogin: ZodRequestBody = {
    description: "User login",
    content: {
        "application/json": {
            schema: LoginSchema,
        },
    },
}

export const PostVerifyEmailSchema = z.object({
    query: z.object({
        token: z.string().uuid(),
    }),
});

export const PostLoginSchema= z.object({
    body: LoginSchema,
});
