import { extendZodWithOpenApi, ZodRequestBody } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;

export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    password: z.string().optional(),
    name: z.string().optional(),
    avt_url: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const GetUserSchema = z.object({
    params: z.object({
        id: z.number().min(1).optional(),
    }),
});

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const PostList: ZodRequestBody = {
  description: 'Update profile',
  content: {
    'application/json': {
      schema: UpdateProfileSchema,
    },
  },
};


export const UpdateUserSchema = z.object({
    param: z.object({
        id: z.number().min(1),
    }),
    body: UpdateProfileSchema,
});