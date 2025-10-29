import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import { TaskStatusEnum } from "@assetmanagement/common-types";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { notifyTaskAssigned } from "../services/notificationService.js";
import { toPrismaTaskStatus } from "../mappers/enums.js";
import { toTaskSummary } from "../mappers/taskMapper.js";

const router = Router();

const taskNotificationUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  whatsappApiKey: true,
  companyId: true
} as const;

const taskQuerySchema = z.object({
  status: TaskStatusEnum.optional(),
  handlerId: z.coerce.number().int().optional()
});

const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  handlerId: z.number().int(),
  assetId: z.number().int().optional(),
  dueDate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? null : val,
    z.string().datetime().nullable().optional()
  ),
  files: z.array(z.string()).optional(),
  status: TaskStatusEnum.default("To Do")
});

const taskUpdateSchema = taskCreateSchema.partial();

router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const query = taskQuerySchema.parse(req.query);

    const tasks = await prisma.task.findMany({
      where: {
        ...(query.status ? { status: toPrismaTaskStatus(query.status) } : {}),
        ...(query.handlerId ? { handlerId: query.handlerId } : {}),
        OR: [
          { createdBy: { companyId: req.user.companyId } },
          { handler: { companyId: req.user.companyId } }
        ]
      },
      include: {
        createdBy: { select: taskNotificationUserSelect },
        handler: { select: taskNotificationUserSelect }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json({ tasks: tasks.map(toTaskSummary) });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const payload = taskCreateSchema.parse(req.body);

    const handler = await prisma.user.findUnique({
      where: { id: payload.handlerId },
      select: taskNotificationUserSelect
    });

    if (!handler || handler.companyId !== req.user.companyId) {
      res.status(400).json({ message: "Handler must belong to the same company" });
      return;
    }

    if (payload.assetId) {
      const asset = await prisma.asset.findUnique({
        where: { id: payload.assetId }
      });

      if (!asset || asset.companyId !== req.user.companyId) {
        res.status(400).json({ message: "Asset must belong to the same company" });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description,
        handlerId: payload.handlerId,
        assetId: payload.assetId,
        createdById: req.user.id,
        status: toPrismaTaskStatus(payload.status),
        dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
        files: payload.files ?? []
      },
      include: {
        createdBy: { select: taskNotificationUserSelect },
        handler: { select: taskNotificationUserSelect }
      }
    });

    await notifyTaskAssigned(
      {
        name: task.handler.name,
        phone: task.handler.phone,
        email: task.handler.email,
        whatsappApiKey: task.handler.whatsappApiKey ?? undefined
      },
      {
        name: task.createdBy.name,
        phone: task.createdBy.phone,
        email: task.createdBy.email,
        whatsappApiKey: task.createdBy.whatsappApiKey ?? undefined
      },
      { title: task.title, description: task.description }
    );

    res.status(201).json({ task: toTaskSummary(task) });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:taskId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const taskId = Number.parseInt(req.params.taskId, 10);
      if (Number.isNaN(taskId)) {
        res.status(400).json({ message: "Invalid task id" });
        return;
      }

      const existing = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          createdBy: { select: taskNotificationUserSelect },
          handler: { select: taskNotificationUserSelect }
        }
      });

      if (!existing) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (
        req.user.role !== "admin" &&
        req.user.companyId !== existing.createdBy.companyId &&
        req.user.companyId !== existing.handler.companyId
      ) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const payload = taskUpdateSchema.parse(req.body);

      if (payload.assetId) {
        const asset = await prisma.asset.findUnique({ where: { id: payload.assetId } });
        if (!asset || asset.companyId !== existing.createdBy.companyId) {
          res.status(400).json({ message: "Asset must belong to the same company" });
          return;
        }
      }

      let handlerChanged = false;
      let awaitingConfirmation = false;

      if (payload.handlerId && payload.handlerId !== existing.handlerId) {
        const handler = await prisma.user.findUnique({
          where: { id: payload.handlerId },
          select: taskNotificationUserSelect
        });

        if (!handler || handler.companyId !== existing.createdBy.companyId) {
          res.status(400).json({ message: "Handler must belong to the same company" });
          return;
        }

        handlerChanged = true;
      }

      if (payload.status) {
        awaitingConfirmation = payload.status === "Awaiting Confirmation";
      }

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: payload.title,
          description: payload.description,
          handlerId: payload.handlerId,
          assetId: payload.assetId,
          status: payload.status ? toPrismaTaskStatus(payload.status) : undefined,
          dueDate: payload.dueDate !== undefined 
            ? (payload.dueDate ? new Date(payload.dueDate) : null)
            : undefined,
          files:
            payload.files ?? (Array.isArray(existing.files) ? existing.files : [])
        },
        include: {
          createdBy: { select: taskNotificationUserSelect },
          handler: { select: taskNotificationUserSelect }
        }
      });

      if (handlerChanged) {
        await notifyTaskAssigned(
          {
            name: updated.handler.name,
            phone: updated.handler.phone,
            email: updated.handler.email
          },
          {
            name: updated.createdBy.name,
            phone: updated.createdBy.phone,
            email: updated.createdBy.email
          },
          { title: updated.title, description: updated.description }
        );
      }

      if (awaitingConfirmation) {
        await notifyTaskAssigned(
          {
            name: updated.createdBy.name,
            phone: updated.createdBy.phone,
            email: updated.createdBy.email
          },
          {
            name: updated.handler.name,
            phone: updated.handler.phone,
            email: updated.handler.email
          },
          { title: updated.title, description: "Task is awaiting confirmation" }
        );
      }

      res.json({ task: toTaskSummary(updated) });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /tasks/:id - Delete a task
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const taskId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(taskId)) {
      res.status(400).json({ message: "Invalid task ID" });
      return;
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        createdBy: { select: { companyId: true } },
        handler: { select: { companyId: true } }
      }
    });

    if (!existing) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Check if user belongs to the same company
    if (
      existing.createdBy.companyId !== req.user.companyId &&
      existing.handler.companyId !== req.user.companyId
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
