import type { Task, User } from "@prisma/client";
import type { TaskSummary } from "@assetmanagement/common-types";

import { fromPrismaTaskStatus } from "./enums.js";

type LightUser = Pick<User, "id" | "name" | "phone" | "email" | "companyId">;

export type TaskWithRelations = Task & {
  createdBy: LightUser;
  handler: LightUser;
};

export const toTaskSummary = (task: TaskWithRelations): TaskSummary => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: fromPrismaTaskStatus(task.status),
  createdBy: {
    id: task.createdBy.id,
    name: task.createdBy.name,
    phone: task.createdBy.phone
  },
  handler: {
    id: task.handler.id,
    name: task.handler.name,
    phone: task.handler.phone
  },
  assetId: task.assetId ?? null,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  files: Array.isArray(task.files) ? (task.files as string[]) : []
});
