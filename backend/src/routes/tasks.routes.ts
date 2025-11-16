import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "../controllers/tasks.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(requireAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/toggle", toggleTask);

export default router;
