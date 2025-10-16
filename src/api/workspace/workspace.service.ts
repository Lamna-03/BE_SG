import { ResponseStatus,ServiceResponse } from "../../common/models/serviceResponse";
import { UserRepository } from "../user/user.repository";
import { CreateWorkspaceType, UpdateWorkspaceType } from "./schemas/workspaceSchema";
import { WorkspaceRepository } from "./workspace.repository";
import { Workspace } from "../../common/entities/Workspace.entity";

export class WorkspaceService {
    constructor(
        private workspaceRepository = new WorkspaceRepository(),
        private userRegistry = new UserRepository()
    ){}

    async createWorkspace(
        data:CreateWorkspaceType,
        ownerId: string
    ):Promise<ServiceResponse<Workspace | null>>{
        try{
            const owner = await this.userRegistry.findById(ownerId);
            if(!owner){
                return new ServiceResponse(ResponseStatus.FAIL,"Owner not found",null,404);
            }

            const newWorkspace = await this.workspaceRepository.create(data,owner);
            //chuyen doi entity sang object de tranh loi"circular refrence" khi respon JSON
            const result = {...newWorkspace,owner_id:newWorkspace.owner.id};
            delete (result as any).owner;

            return new ServiceResponse(
                ResponseStatus.SUCCESS,
                'Workspace created successfully',
                result as any,
                201
            );
        }catch(error){
            const errorMessage = `Error creating workspace: ${(error as Error).message}`;
            return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, 500);
        }
    }

    async getWorkspaceForUser(userId: string): Promise<ServiceResponse<Workspace[] | null>> {
        try{
            const workspaces = await this.workspaceRepository.findWorkspacesByUserId(userId);
            return new ServiceResponse(
                ResponseStatus.SUCCESS,
                'Workspace retrieved successfully',
                workspaces,
                200
            );
        }catch(error){
           const errorMessage = `Error retrieving workspaces: ${(error as Error).message}`;
      return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, 500);
        }
    }

    async getWorkspaceDetails(
    workspaceId: string,
    userId: string
  ): Promise<ServiceResponse<Workspace | null>> {
    try {
      const workspace = await this.workspaceRepository.findByIdAndUserId(workspaceId, userId);
      if (!workspace) {
        return new ServiceResponse(ResponseStatus.FAIL, 'Workspace not found or access denied', null, 404);
      }
      return new ServiceResponse(
        ResponseStatus.SUCCESS,
        'Workspace retrieved successfully',
        workspace,
        200
      );
    } catch (error) {
       const errorMessage = `Error retrieving workspace: ${(error as Error).message}`;
      return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, 500);
    }
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceType
  ): Promise<ServiceResponse<Workspace | null>> {
    try {
      // 1. Kiểm tra xem user có phải là thành viên và có quyền không
      const member = await this.workspaceRepository.findMember(workspaceId, userId);
      if (!member) {
        return new ServiceResponse(ResponseStatus.FAIL, 'Access denied', null, 403);
      }

      // 🛡️ Logic phân quyền: Chỉ OWNER hoặc ADMIN mới được sửa
      if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
        return new ServiceResponse(ResponseStatus.FAIL, 'Insufficient permissions to update', null, 403);
      }

      // 2. Nếu có quyền, tiến hành cập nhật
      const updatedWorkspace = await this.workspaceRepository.update(workspaceId, data);
      if (!updatedWorkspace) {
        return new ServiceResponse(ResponseStatus.FAIL, 'Workspace not found', null, 404);
      }

      return new ServiceResponse(
        ResponseStatus.SUCCESS,
        'Workspace updated successfully',
        updatedWorkspace,
        200
      );
    } catch (error) {
      const errorMessage = `Error updating workspace: ${(error as Error).message}`;
      return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, 500);
    }
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<ServiceResponse<null>> {
        try {
            // 1. Kiểm tra quyền của người thực hiện
            const member = await this.workspaceRepository.findMember(workspaceId, userId);
            if (!member) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Access denied', null, 403);
            }

            // 🛡️ Logic phân quyền: Chỉ OWNER mới được xóa
            if (member.role !== 'OWNER') {
                return new ServiceResponse(ResponseStatus.FAIL, 'Only the owner can delete the workspace', null, 403);
            }

            // 2. Nếu có quyền, tiến hành xóa
            const deleted = await this.workspaceRepository.deleteById(workspaceId);
            if (!deleted) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Workspace not found', null, 404);
            }

            return new ServiceResponse(
                ResponseStatus.SUCCESS,
                'Workspace deleted successfully',
                null,
                200
            );
        } catch (error) {
            const errorMessage = `Error deleting workspace: ${(error as Error).message}`;
            return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, 500);
        }
    }

    //inviteMember
    //removeMember
    //getMember
}
