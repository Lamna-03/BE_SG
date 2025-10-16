// src/board/board.router.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';
import { createApiResponse } from '../../api-docs/openAPIResponseBuilders';
import { authenticateJWT } from '../../common/middleware/auth.middleware';
import { handleServiceResponse, validateRequest } from '../../common/utils/httpHandlers';
import {
  BoardParamsSchema,
  BoardSchema,
  CreateBoardSchema,
  PostBoard,
  UpdateBoardSchema,
} from './schemas/boardSchema';
import { BoardService } from './board.service';

export const boardRegistry = new OpenAPIRegistry();
boardRegistry.register('Board', BoardSchema);

// Quan trọng: Thêm { mergeParams: true } để router con có thể truy cập params của router cha (ví dụ: :workspaceId)
const router = express.Router({ mergeParams: true });
const boardService = new BoardService();


boardRegistry.registerPath({
  method: 'post',
  path: '/workspaces/{workspaceId}/boards',
  tags: ['Boards'],
  summary: 'Create a new board in a workspace',
  security: [{ bearerAuth: [] }],
  request: {
    params: CreateBoardSchema.shape.params,
    body: PostBoard,
  },
  responses: createApiResponse(BoardSchema, 'success', 201),
});

boardRegistry.registerPath({
  method: 'get',
  path: '/workspaces/{workspaceId}/boards',
  tags: ['Boards'],
  summary: 'Get all boards in a workspace',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ workspaceId: z.string().uuid() }),
  },
  responses: createApiResponse(z.array(BoardSchema), 'success'),
});

boardRegistry.registerPath({
    method: 'put',
    path: '/workspaces/{workspaceId}/boards/{boardId}',
    tags: ['Boards'],
    summary: 'Update a board by ID',
    security: [{ bearerAuth: [] }],
    request: {
        params: UpdateBoardSchema.shape.params,
        body: {
            content: { 'application/json': { schema: UpdateBoardSchema.shape.body }},
        },
    },
    responses: createApiResponse(BoardSchema, 'success'),
});

boardRegistry.registerPath({
    method: 'delete',
    path: '/workspaces/{workspaceId}/boards/{boardId}',
    tags: ['Boards'],
    summary: 'Delete a board by ID',
    security: [{ bearerAuth: [] }],
    request: { params: BoardParamsSchema.shape.params },
    responses: createApiResponse(z.object({ message: z.string() }), 'success'),
});



// Áp dụng middleware xác thực cho tất cả các route của board
router.use(authenticateJWT);

// [POST] /workspaces/:workspaceId/boards - Tạo board mới
router.post('/', validateRequest(CreateBoardSchema), async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { workspaceId } = req.params;
    const boardData = req.body;
    const serviceResponse = await boardService.createBoard(boardData, workspaceId, userId);
    handleServiceResponse(serviceResponse, res);
});

// [GET] /workspaces/:workspaceId/boards - Lấy tất cả board trong workspace
router.get('/', validateRequest(z.object({ params: z.object({ workspaceId: z.string().uuid() }) })), async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { workspaceId } = req.params;
    const serviceResponse = await boardService.getBoardsForWorkspace(workspaceId, userId);
    handleServiceResponse(serviceResponse, res);
});

// [PUT] /workspaces/:workspaceId/boards/:boardId - Cập nhật board
router.put('/:boardId', validateRequest(UpdateBoardSchema), async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { workspaceId, boardId } = req.params;
    const data = req.body;
    const serviceResponse = await boardService.updateBoard(workspaceId, boardId, userId, data);
    handleServiceResponse(serviceResponse, res);
});

// [DELETE] /workspaces/:workspaceId/boards/:boardId - Xóa board
router.delete('/:boardId', validateRequest(BoardParamsSchema), async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { workspaceId, boardId } = req.params;
    const serviceResponse = await boardService.deleteBoard(workspaceId, boardId, userId);
    handleServiceResponse(serviceResponse, res);
});

export const boardRouter: Router = router;