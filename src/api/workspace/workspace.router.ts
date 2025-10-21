import { ServiceResponse } from './../../common/models/serviceResponse';
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, {Request,Response, Router} from 'express'
import { z } from 'zod'

import { createApiResponse } from '../../api-docs/openAPIResponseBuilders';
import { authenticateJWT } from '../../common/middleware/auth.middleware';
import { handleServiceResponse, validateRequest } from '../../common/utils/httpHandlers';
import { CreateWorkspaceSchema, WorkspaceIdSchema, PostWorkspace, WorkspaceSchema, UpdateWorkspaceSchema, InviteMemberSchema, MemberParamsSchema, UpdateMemberRoleSchema } from './schemas/workspaceSchema';
import { WorkspaceService } from './workspace.service';
import { checkWorkspaceRole } from '../../common/middleware/auth.middleware';

export const workspaceRegistry = new OpenAPIRegistry();
workspaceRegistry.register('Workspace', WorkspaceSchema);

const router = express.Router();
const workspaceService = new WorkspaceService();

//Dang ki OpenAPI paths
workspaceRegistry.registerPath({
    method: 'post',
    path: '/workspaces',
    tags: ['Workspaces'],
    summary: 'Create a new workspace',
    security: [{bearerAuth: []}],
    request: {body: PostWorkspace},
    responses: createApiResponse(WorkspaceSchema,'sucess',201),
});

workspaceRegistry.registerPath({
  method: 'get',
  path: '/workspaces',
  tags: ['Workspaces'],
  summary: 'Get all workspaces for the current user',
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(z.array(WorkspaceSchema), 'success'),
});

workspaceRegistry.registerPath({
  method: 'get',
  path: '/workspaces/{id}',
  tags: ['Workspaces'],
  summary: 'Get a single workspace by ID',
  security: [{ bearerAuth: [] }],
  request: { params: WorkspaceIdSchema.shape.params },
  responses: createApiResponse(WorkspaceSchema, 'success'),
});

workspaceRegistry.registerPath({
  method: 'put',
  path: '/workspaces/{id}',
  tags: ['Workspaces'],
  summary: 'Update a single workspace by ID',
  security: [{ bearerAuth: [] }],
  request: {
     params: WorkspaceIdSchema.shape.params,
      body:{
        content: {
                'application/json': {
                    schema: UpdateWorkspaceSchema.shape.body,
                },
            },
      }
   },
  responses: createApiResponse(WorkspaceSchema, 'success'),
});

workspaceRegistry.registerPath({
    method: 'delete',
    path: '/workspaces/{id}',
    tags: ['Workspaces'],
    summary: 'Delete a workspace by ID',
    security: [{ bearerAuth: [] }],
    request: { params: WorkspaceIdSchema.shape.params },
    responses: createApiResponse(z.object({ message: z.string() }), 'success'),
});




// Áp dụng middleware xác thực cho tất cả các route bên dưới
router.use(authenticateJWT);


// [POST] /workspaces - Tạo workspace mới
router.post('/', validateRequest(CreateWorkspaceSchema), async (req: Request, res: Response) => {
  const ownerId = (req as any).user.userId;
  const serviceResponse = await workspaceService.createWorkspace(req.body, ownerId);
  handleServiceResponse(serviceResponse, res);
});

// [GET] /workspaces - Lấy tất cả workspace của user hiện tại
router.get('/', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const serviceResponse = await workspaceService.getWorkspaceForUser(userId);
  handleServiceResponse(serviceResponse, res);
});

// [GET] /workspaces/:id - Lấy chi tiết một workspace
router.get('/:id', validateRequest(WorkspaceIdSchema), async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const serviceResponse = await workspaceService.getWorkspaceDetails(id, userId);
  handleServiceResponse(serviceResponse, res);
});

// [PUT] /workspaces/:id - Cập nhật workspace
router.put('/:id', validateRequest(UpdateWorkspaceSchema),checkWorkspaceRole(['OWNER', 'ADMIN']), async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const data = req.body;
    const serviceResponse = await workspaceService.updateWorkspace(id, userId, data);
    handleServiceResponse(serviceResponse, res);
});

// [DELETE] /workspaces/:id - Xóa workspace
router.delete('/:id', validateRequest(WorkspaceIdSchema),checkWorkspaceRole(['OWNER']), async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const serviceResponse = await workspaceService.deleteWorkspace(id, userId);
    handleServiceResponse(serviceResponse, res);
});

// [POST] /workspaces/:id/members - Mời thành viên mới
router.post('/:id/members', validateRequest(InviteMemberSchema),checkWorkspaceRole(['OWNER', 'ADMIN']), async (req: Request, res: Response) => {
    const inviterId = (req as any).user.userId;
    const { id } = req.params;
    const inviteData = req.body;
    const serviceResponse = await workspaceService.inviteMember(id, inviterId, inviteData);
    handleServiceResponse(serviceResponse, res);
});

// [GET] /workspaces/:id/members - Lấy danh sách thành viên
router.get('/:id/members', validateRequest(WorkspaceIdSchema),
    checkWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
async (req: Request, res: Response) => {
    const requesterId = (req as any).user.userId;
    const { id } = req.params;
    const serviceResponse = await workspaceService.getWorkspaceMembers(id, requesterId);
    handleServiceResponse(serviceResponse, res);
});

// [DELETE] /workspaces/:workspaceId/members/:userId - Xóa thành viên
router.delete('/:workspaceId/members/:userId', validateRequest(MemberParamsSchema),checkWorkspaceRole(['OWNER', 'ADMIN']), async (req: Request, res: Response) => {
    const removerId = (req as any).user.userId;
    const { workspaceId, userId } = req.params;
    const serviceResponse = await workspaceService.removeMemberFromWorkspace(workspaceId, removerId, userId);
    handleServiceResponse(serviceResponse, res);
});

// [PUT] /workspaces/:workspaceId/members/:userId - Cập nhật vai trò thành viên
router.put('/:workspaceId/members/:userId', validateRequest(UpdateMemberRoleSchema),checkWorkspaceRole(['OWNER', 'ADMIN']), async (req: Request, res: Response) => {
    const updaterId = (req as any).user.userId;
    const { workspaceId, userId } = req.params;
    const data = req.body;
    const serviceResponse = await workspaceService.updateMemberRole(workspaceId, updaterId, userId, data);
    handleServiceResponse(serviceResponse, res);
});


export const workspaceRouter: Router = router;