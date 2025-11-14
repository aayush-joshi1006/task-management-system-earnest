import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import z from "zod";

export interface AuthRequest extends Request {
  user?: { id: string; email?: string };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = verifyAccessToken(token) as any;
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


export function validate(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(400).json({
        message:
          err.errors?.map((e: any) => e.message).join(", ") || "Invalid input",
      });
    }
  };
}