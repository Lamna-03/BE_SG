import { z } from "zod";
import { extendZodWithOpenApi,ZodRequestBody } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, "Tên workspace phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
  owner_id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkspaceSchema = z.object({
     body: z.object({
        name: z.string().min(3, "Tên workspace phải có ít nhất 3 ký tự").openapi({ example: "My Workspace" }),
        description: z.string().optional().openapi({ example: "This is my workspace" }), 
      }),
    });
export type CreateWorkspaceType = z.infer<typeof CreateWorkspaceSchema>["body"];

//de validate id tu params
export const WorkspaceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  }),
});

//schema de cap nhat workspace
export const UpdateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workspace name cannot be empty').optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
});

export type UpdateWorkspaceType = z.infer<typeof UpdateWorkspaceSchema>['body'];

export const InviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], {
      errorMap: () => ({ message: 'Role must be one of: ADMIN, MEMBER, VIEWER' }),
    }),
  }),
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
});

export type InviteMemberType = z.infer<typeof InviteMemberSchema>['body'];

// Schema để validate params khi xóa hoặc cập nhật thành viên
export const MemberParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid('Invalid workspace ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

//schema cho openapi
export const PostWorkspace: ZodRequestBody = {
  description: "Create a new workspace",
  content: {
    "application/json": {
      schema: CreateWorkspaceSchema.shape.body,
    },
  },
};



