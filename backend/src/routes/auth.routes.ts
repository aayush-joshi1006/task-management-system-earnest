import express, { Request, Response, NextFunction } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../validators/auth.validators";
import { validate } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
