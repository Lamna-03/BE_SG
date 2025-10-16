// src/board/board.service.ts
import { ResponseStatus, ServiceResponse } from '../../common/models/serviceResponse';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { BoardRepository } from './board.repository';
import { Board } from '../../common/entities/Board.entity';
import { CreateBoardType, UpdateBoardType } from './schemas/boardSchema';
import { StatusCodes } from 'http-status-codes';

export class BoardService {
    constructor(
        private boardRepository = new BoardRepository(),
        private workspaceRepository = new WorkspaceRepository() // We need this to check permissions
    ) { }

    // check co phai la thanh vien cua workspace khong
    private async canAccessWorkspace(workspaceId: string, userId: string): Promise<boolean> {
        const workspace = await this.workspaceRepository.findByIdAndUserId(workspaceId, userId);
        return !!workspace;
    }

    async createBoard(
        data: CreateBoardType,
        workspaceId: string,
        userId: string
    ): Promise<ServiceResponse<Board | null>> {
        try {
            const canAccess = await this.canAccessWorkspace(workspaceId, userId);
            if (!canAccess) {
                return new ServiceResponse(
                    ResponseStatus.FAIL, 'Workspace not found or access denied', null, StatusCodes.FORBIDDEN
                );
            }

            const workspace = await this.workspaceRepository.findByIdAndUserId(workspaceId, userId);
            if (!workspace) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Workspace not found', null, StatusCodes.NOT_FOUND);
            }

            const newBoard = await this.boardRepository.create(data, workspace);
            return new ServiceResponse(
                ResponseStatus.SUCCESS, 'Board created successfully', newBoard, StatusCodes.CREATED
            );
        } catch (error) {
            const errorMessage = `Error creating board: ${(error as Error).message}`;
            return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getBoardsForWorkspace(workspaceId: string, userId: string): Promise<ServiceResponse<Board[] | null>> {
        try {

            const canAccess = await this.canAccessWorkspace(workspaceId, userId);
            if (!canAccess) {
                return new ServiceResponse(
                    ResponseStatus.FAIL, 'Workspace not found or access denied', null, StatusCodes.FORBIDDEN
                );
            }

            const boards = await this.boardRepository.findByWorkspaceId(workspaceId);
            return new ServiceResponse(
                ResponseStatus.SUCCESS, 'Boards retrieved successfully', boards, StatusCodes.OK
            );
        } catch (error) {
            const errorMessage = `Error retrieving boards: ${(error as Error).message}`;
            return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateBoard(
        workspaceId: string,
        boardId: string,
        userId: string,
        data: UpdateBoardType
    ): Promise<ServiceResponse<Board | null>> {
        try {
            const canAccess = await this.canAccessWorkspace(workspaceId, userId);
            if (!canAccess) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Access denied', null, StatusCodes.FORBIDDEN);
            }

            const member = await this.workspaceRepository.findMember(workspaceId, userId);
            if (member && member.role !== 'OWNER' && member.role !== 'ADMIN') {
                return new ServiceResponse(
                    ResponseStatus.FAIL,
                    'Insufficient permissions. Only OWNER or ADMIN can delete boards.',
                    null,
                    StatusCodes.FORBIDDEN
                );
            }

            const board = await this.boardRepository.findByIdAndWorkspaceId(boardId, workspaceId);
            if (!board) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Board not found in this workspace', null, StatusCodes.NOT_FOUND);
            }

            const updatedBoard = await this.boardRepository.update(board, data);
            return new ServiceResponse(ResponseStatus.SUCCESS, 'Board updated successfully', updatedBoard, StatusCodes.OK);
        } catch (error) {
            const errorMessage = `Error updating board: ${(error as Error).message}`;
            return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteBoard(
        workspaceId: string,
        boardId: string,
        userId: string
    ): Promise<ServiceResponse<null>> {
        try {
            const canAccess = await this.canAccessWorkspace(workspaceId, userId);
            if (!canAccess) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Access denied', null, StatusCodes.FORBIDDEN);
            }

            //check phan quyen
            const member = await this.workspaceRepository.findMember(workspaceId, userId);
            if (member && member.role !== 'OWNER' && member.role !== 'ADMIN') {
                return new ServiceResponse(
                    ResponseStatus.FAIL,
                    'Insufficient permissions. Only OWNER or ADMIN can delete boards.',
                    null,
                    StatusCodes.FORBIDDEN
                );
            }
            const board = await this.boardRepository.findByIdAndWorkspaceId(boardId, workspaceId);
            if (!board) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Board not found in this workspace', null, StatusCodes.NOT_FOUND);
            }

            const deleted = await this.boardRepository.delete(boardId);
            if (!deleted) {
                return new ServiceResponse(ResponseStatus.FAIL, 'Failed to delete board', null, StatusCodes.INTERNAL_SERVER_ERROR);
            }

            return new ServiceResponse(ResponseStatus.SUCCESS, 'Board deleted successfully', null, StatusCodes.OK);
        } catch (error) {
            const errorMessage = `Error deleting board: ${(error as Error).message}`;
            return new ServiceResponse(ResponseStatus.ERROR, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}