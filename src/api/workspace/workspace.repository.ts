import { AppDataSource } from "../../configs/typeorm.config";
import { Workspace } from "../../common/entities/Workspace.entity";
import { User } from "../../common/entities/User.entity";
import { Workspace_member } from "../../common/entities/Workspace_member.entity";
export class WorkspaceRepository {
    private workspaceRepository = AppDataSource.getRepository(Workspace);
    private memberRepository = AppDataSource.getRepository(Workspace_member);

    async create(WorkspaceData: Partial<Workspace>, owner: User):Promise<Workspace> {
        return AppDataSource.transaction(async (transactionalEntityManager) => {
            const newWorkspace = transactionalEntityManager.create(Workspace,{
                ...WorkspaceData,
                owner: owner,
            });
            const savedWorkspace = await transactionalEntityManager.save(newWorkspace);
            const ownerMember = transactionalEntityManager.create(Workspace_member, {
                user: owner,
                workspace: savedWorkspace,
                role: "OWNER",
            });
            await transactionalEntityManager.save(ownerMember);
            return savedWorkspace;
        });
    }

    //tim cac workspace ma user la member
    async findWorkspacesByUserId(userId: string): Promise<Workspace[]> {
        return this.workspaceRepository.createQueryBuilder("workspace")
        .leftJoin("workspace.members", "member") // Join từ workspace -> members
        .leftJoin("member.user", "user")         // Join từ member -> user
        .where("user.id = :userId", { userId })   // Bây giờ điều kiện where sẽ hoạt động
        .getMany();
    }

    //tim 1 user cu the va kiem tra xem co phai member ko
    async findByIdAndUserId(workspaceId: string, userId: string): Promise<Workspace | null> {
        return this.workspaceRepository.createQueryBuilder("workspace")
        .leftJoin("workspace.members", "member") 
        .where("workspace.id = :workspaceId", { workspaceId })
      .andWhere("member.user_id = :userId", { userId })
      .getOne();
    }

    //lay thong tin thanh vien trong workspace
    async findMember(workspaceId: string, userId: string): Promise<Workspace_member | null> {
        return this.memberRepository.findOne({
            where: {
                workspace: { id: workspaceId },
                user: { id: userId },
            },
            
        });
    }


  async update(id: string, workspaceData: Partial<Workspace>): Promise<Workspace | null> {
    const workspace = await this.workspaceRepository.findOneBy({ id });
    if (!workspace) {
      return null;
    }
    this.workspaceRepository.merge(workspace, workspaceData);
    return this.workspaceRepository.save(workspace);
  }

  async deleteById(id: string): Promise<boolean> {
        const result = await this.workspaceRepository.delete(id);
        return result.affected !== 0;
    }

    async addMember(workspace: Workspace, user: User, role: 'ADMIN' | 'MEMBER' | 'VIEWER'): Promise<Workspace_member> {
        const newMember = this.memberRepository.create({
            workspace,
            user,
            role,
        });
        return this.memberRepository.save(newMember);
    }

    async removeMember(workspaceId: string, userId: string): Promise<boolean> {
        const result = await this.memberRepository.delete({
            workspace: { id: workspaceId },
            user: { id: userId },
        });
        return result.affected !== 0;
    }

    async listMembers(workspaceId: string): Promise<Workspace_member[]> {
        return this.memberRepository.find({
            where: { workspace: { id: workspaceId } },
            relations: ['user'], // Lấy cả thông tin user
        });
    }
}