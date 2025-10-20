import { uuid } from './../../../node_modules/zod/src/v4/core/regexes';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type UserType = z.infer<typeof UserSchema>;

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    password: z.string().optional(),
    name: z.string().optional(),
    avt_url: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    avt_url: z.string().optional(),
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;

export const GetUserSchema = z.object({
    params: z.object({
        id: z.string().min(1).optional(),
    }),
});