// src/board/board.schema.ts
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const BoardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  workspaceId: z.string().uuid(), // Always include workspaceId in the response
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a new Board.
// We get the workspaceId from the URL parameters.
export const CreateBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Board name is required'),
    description: z.string().optional(),
  }),
  params: z.object({
    workspaceId: z.string().uuid('Invalid workspace ID'),
  }),
});
export type CreateBoardType = z.infer<typeof CreateBoardSchema>['body'];

// Schema for updating a Board
export const UpdateBoardSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
    }),
    params: z.object({
        // We need both IDs to locate and verify the board
        workspaceId: z.string().uuid('Invalid workspace ID'),
        boardId: z.string().uuid('Invalid board ID'),
    }),
});
export type UpdateBoardType = z.infer<typeof UpdateBoardSchema>['body'];


// Schema for validating parameters for GET or DELETE operations
export const BoardParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid('Invalid workspace ID'),
    boardId: z.string().uuid('Invalid board ID'),
  }),
});

// Schema for OpenAPI documentation
export const PostBoard: ZodRequestBody = {
  description: 'Create a new board within a workspace',
  content: {
    'application/json': {
      schema: CreateBoardSchema.shape.body,
    },
  },
};