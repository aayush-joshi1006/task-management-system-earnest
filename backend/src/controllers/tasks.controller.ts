import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthRequest } from "../middlewares/auth.middleware";

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const { title, description } = req.body;
    const userId = req.user!.id;
    if (!title) return res.status(400).json({ message: "Title required" });

    const task = await prisma.task.create({
      data: { title, description, userId },
    });
    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(50, Number(req.query.perPage) || 10);
    const status = req.query.status as string | undefined;
    const q = (req.query.q as string | undefined) ?? "";

    const where: any = { userId };
    if (status) where.status = status;
    if (q) where.title = { contains: q, mode: "insensitive" };

    const total = await prisma.task.count({ where });
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return res.json({
      meta: { total, page, perPage, pages: Math.ceil(total / perPage) },
      data: tasks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return res.status(404).json({ message: "Not found" });
    return res.json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, description, status } = req.body;

    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return res.status(404).json({ message: "Not found" });

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
      },
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return res.status(404).json({ message: "Not found" });

    await prisma.task.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function toggleTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return res.status(404).json({ message: "Not found" });

    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updated = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
