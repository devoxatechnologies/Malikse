import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches `req.user` on success.
 */
export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * RBAC guard — call after authGuard.
 * Usage: roleGuard("admin", "advisor")
 */
export function roleGuard(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
