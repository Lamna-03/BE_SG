import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { WorkspaceRepository } from '../../api/workspace/workspace.repository'; // Import repository
import { StatusCodes } from 'http-status-codes';

// Middleware xác thực token
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Nếu không có header Authorization
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Missing Authorization header",
    });
  }

  // Cấu trúc header phải là "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing token in header",
    });
  }

  try {
    // Giải mã token
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret);

    // Gán thông tin user vào req
    (req as any).user = decoded;

    // Cho phép đi tiếp
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


const workspaceRepository = new WorkspaceRepository();
type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const checkWorkspaceRole = (allowedRoles: WorkspaceRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      
      // Lấy workspaceId từ params. (Lưu ý: router cha là /:id, router con là /:workspaceId)
      const workspaceId = req.params.id || req.params.workspaceId; 

      if (!workspaceId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Workspace ID is missing from URL parameters.',
        });
      }

      // 1. Lấy vai trò của người dùng
      const membership = await workspaceRepository.findMember(workspaceId, userId);

      // 2. Kiểm tra
      if (!membership) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: 'Access denied. You are not a member of this workspace.',
        });
      }

      // 3. Kiểm tra vai trò có được phép không
      if (!allowedRoles.includes(membership.role)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}.`,
        });
      }

      // 4. Nếu mọi thứ OK, cho phép đi tiếp
      // Gắn thông tin membership vào req để service có thể dùng
      (req as any).membership = membership; 
      next();

    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error during authorization check.',
      });
    }
  };
};