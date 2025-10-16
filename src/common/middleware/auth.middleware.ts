import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
