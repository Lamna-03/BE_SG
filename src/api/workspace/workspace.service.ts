import { ResponseStatus,ServiceResponse } from "../../common/models/serviceResponse";
import { UserRepository } from "../user/user.repository";
import { CreateWorkspaceType, InviteMemberType, UpdateMemberRoleType,MemberParamsSchema, UpdateWorkspaceType } from "./schemas/workspaceSchema";
import { WorkspaceRepository } from "./workspace.repository";
import { Workspace } from "../../common/entities/Workspace.entity";
import { Workspace_member } from "../../common/entities/Workspace_member.entity";
import { StatusCodes } from "http-status-codes";

export class WorkspaceService {
    constructor(
        private workspaceRepository = new WorkspaceRepository(),
        private userRepository = new UserRepository()
    ){}

    async createWorkspace(
        data:CreateWorkspaceType,
        ownerId: string
    ):Promise<ServiceResponse<Workspace | null>>{
        try{
            const owner = await this.userRepository.findById(ownerId);
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
      const member = await this.workspaceRepository.findMember(workspaceId, userId);

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
    async inviteMember(
    workspaceId: string,
    inviterId: string, // ID của người mời
    inviteData: InviteMemberType
  ): Promise<ServiceResponse<Workspace_member | null>> {
    try {
      // 1. 🛡️ Phân quyền: Ai được mời? Chỉ OWNER hoặc ADMIN.
      const inviterMembership = await this.workspaceRepository.findMember(workspaceId, inviterId);

      // 2. Tìm user được mời qua email
      const userToInvite = await this.userRepository.findByEmail(inviteData.email);
      if (!userToInvite) {
        return new ServiceResponse(
          ResponseStatus.FAIL, `User with email '${inviteData.email}' not found.`, null, StatusCodes.NOT_FOUND
        );
      }
      
      // Không cho phép tự mời chính mình
      if(userToInvite.id === inviterId) {
        return new ServiceResponse(ResponseStatus.FAIL, 'You cannot invite yourself.', null, StatusCodes.BAD_REQUEST);
      }

      // 3. Kiểm tra xem user có phải đã là thành viên hay chưa
      const existingMembership = await this.workspaceRepository.findMember(workspaceId, userToInvite.id);
      if (existingMembership) {
        return new ServiceResponse(
          ResponseStatus.FAIL, 'User is already a member of this workspace.', null, StatusCodes.CONFLICT
        );
      }

      // 4. Lấy đối tượng workspace
      const workspace = await this.workspaceRepository.findByIdAndUserId(workspaceId, inviterId);
      if(!workspace) return new ServiceResponse(ResponseStatus.FAIL, 'Workspace not found', null, StatusCodes.NOT_FOUND);

      // 5. Thêm thành viên vào CSDL
      const newMember = await this.workspaceRepository.addMember(workspace, userToInvite, inviteData.role);
      
      // 6. Xóa mật khẩu trước khi trả về
      delete (newMember.user as any).password;

      return new ServiceResponse(
        ResponseStatus.SUCCESS, 'Member invited successfully.', newMember, StatusCodes.CREATED
      );

    } catch (error) {
      const errorMessage = `Error inviting member: ${(error as Error).message}`;
      return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
    //getMember
    async getWorkspaceMembers(workspaceId: string, requesterId: string): Promise<ServiceResponse<any[] | null>> {
      // 🛡️ Bất kỳ thành viên nào cũng có quyền xem danh sách thành viên khác
      const canAccess = await this.workspaceRepository.findMember(workspaceId, requesterId);
      if (!canAccess) {
          return new ServiceResponse(ResponseStatus.FAIL, 'Access denied.', null, StatusCodes.FORBIDDEN);
      }

      const members = await this.workspaceRepository.listMembers(workspaceId);

      // Lọc bỏ thông tin nhạy cảm (như password) trước khi trả về
      const safeMembers = members.map(member => ({
          id: member.id,
          role: member.role,
          user: {
              id: member.user.id,
              name: member.user.name,
              email: member.user.email,
              avt_url: member.user.avt_url,
          }
      }));
      
      return new ServiceResponse(ResponseStatus.SUCCESS, 'Members retrieved successfully', safeMembers, StatusCodes.OK);
  }

    
    //removeMember
    async removeMemberFromWorkspace(
      workspaceId: string,
      removerId: string,
      userIdToRemove:string
    ): Promise<ServiceResponse<null>>{
      try{

        const removerMembership = await this.workspaceRepository.findMember(workspaceId, removerId);
      // if (!removerMembership || (removerMembership.role !== 'OWNER' && removerMembership.role !== 'ADMIN')) {
      //   return new ServiceResponse(
      //     ResponseStatus.FAIL, 'Insufficient permissions. Only OWNER or ADMIN can remove members.', null, StatusCodes.FORBIDDEN
      //   );
      // }

      if (removerId === userIdToRemove) {
        return new ServiceResponse(ResponseStatus.FAIL, 'You cannot remove yourself.', null, StatusCodes.BAD_REQUEST);
      }

      const memberToRemove = await this.workspaceRepository.findMember(workspaceId, userIdToRemove);
      if (!memberToRemove) {
        return new ServiceResponse(ResponseStatus.FAIL, 'Member not found.', null, StatusCodes.NOT_FOUND);
      }

      if (memberToRemove.role === 'OWNER') {
        return new ServiceResponse(ResponseStatus.FAIL, 'Cannot remove the workspace owner.', null, StatusCodes.BAD_REQUEST);
      }

      if (removerMembership.role === 'ADMIN' && memberToRemove.role === 'ADMIN') {
         return new ServiceResponse(ResponseStatus.FAIL, 'Admins cannot remove other admins.', null, StatusCodes.FORBIDDEN);
      }

      const deleted = await this.workspaceRepository.removeMember(workspaceId, userIdToRemove);
      if (!deleted) {
        return new ServiceResponse(ResponseStatus.FAIL, 'Failed to remove member.', null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      return new ServiceResponse(ResponseStatus.SUCCESS, 'Member removed successfully.', null, StatusCodes.OK);
      }catch (error) {
      const errorMessage = `Error removing member: ${(error as Error).message}`;
      return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
    }

    async updateMemberRole(
      workspaceId: string,
      updaterId: string,
      userIdToUpdate: string,
      data: UpdateMemberRoleType
): Promise<ServiceResponse<Workspace_member | null>> {
        try{
        const updaterMembership = await this.workspaceRepository.findMember(workspaceId, updaterId);
      // if (!updaterMembership || (updaterMembership.role !== 'OWNER' && updaterMembership.role !== 'ADMIN')) {
      //   return new ServiceResponse(
      //     ResponseStatus.FAIL, 'Insufficient permissions. Only OWNER or ADMIN can change roles.', null, StatusCodes.FORBIDDEN
      //   );
      // }
        if (updaterId === userIdToUpdate) {
        return new ServiceResponse(ResponseStatus.FAIL, 'You cannot change your own role.', null, StatusCodes.BAD_REQUEST);
      }

      const memberToUpdate = await this.workspaceRepository.findMember(workspaceId, userIdToUpdate);
      if (!memberToUpdate) {
        return new ServiceResponse(ResponseStatus.FAIL, 'Member not found.', null, StatusCodes.NOT_FOUND);
      }

      if (memberToUpdate.role === 'OWNER') {
        return new ServiceResponse(ResponseStatus.FAIL, 'Cannot change the role of the workspace owner.', null, StatusCodes.BAD_REQUEST);
      }

      if (updaterMembership.role === 'ADMIN' && memberToUpdate.role === 'ADMIN') {
         return new ServiceResponse(ResponseStatus.FAIL, 'Admins cannot change other admins\' roles.', null, StatusCodes.FORBIDDEN);
      }

      if (updaterMembership.role === 'ADMIN' && data.role === 'ADMIN') {
         return new ServiceResponse(ResponseStatus.FAIL, 'Only the OWNER can promote users to ADMIN.', null, StatusCodes.FORBIDDEN);
      }

      const updatedMember = await this.workspaceRepository.updateMemberRole(workspaceId, userIdToUpdate, data.role);
      
      return new ServiceResponse(ResponseStatus.SUCCESS, 'Member role updated successfully.', updatedMember, StatusCodes.OK);
      }catch (error) {
      const errorMessage = `Error updating member role: ${(error as Error).message}`;
      return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
    }
}
