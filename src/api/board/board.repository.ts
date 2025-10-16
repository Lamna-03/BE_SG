// src/board/board.repository.ts
import { AppDataSource } from '../../configs/typeorm.config';
import { Board } from '../../common/entities/Board.entity';
import { Workspace } from '../../common/entities/Workspace.entity';

export class BoardRepository {
  private boardRepository = AppDataSource.getRepository(Board);

 //Tạo một board mới bên trong một workspace cụ thể.
  async create(boardData: Partial<Board>, workspace: Workspace): Promise<Board> {
    const newBoard = this.boardRepository.create({
      ...boardData,
      workspace: workspace,
    });
    return this.boardRepository.save(newBoard);
  }

   // Tìm tất cả các board thuộc về một workspace.
  async findByWorkspaceId(workspaceId: string): Promise<Board[]> {
    return this.boardRepository.find({
      where: {
        workspace: { id: workspaceId },
      },
    });
  }

  /**
   * Tìm một board cụ thể bằng ID của nó VÀ ID của workspace chứa nó.
   * Đây là một hàm quan trọng để đảm bảo an ninh.
   */
  async findByIdAndWorkspaceId(boardId: string, workspaceId: string): Promise<Board | null> {
    return this.boardRepository.findOne({
      where: {
        id: boardId,
        workspace: { id: workspaceId },
      },
    });
  }

  /**
   * Cập nhật thông tin của một board.
   */
  async update(board: Board, updateData: Partial<Board>): Promise<Board> {
    this.boardRepository.merge(board, updateData);
    return this.boardRepository.save(board);
  }

  /**
   * Xóa một board bằng ID của nó.
   */
  async delete(boardId: string): Promise<boolean> {
    const result = await this.boardRepository.delete(boardId);
    return result.affected !== 0;
  }
}