import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/sanitizers.js";

const router = Router();

router.get(
  "/companies/:companyId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = Number.parseInt(req.params.companyId, 10);
      if (Number.isNaN(companyId)) {
        res.status(400).json({ message: "Invalid company id" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      if (req.user.companyId !== companyId && req.user.role !== "admin") {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const users = await prisma.user.findMany({
        where: { companyId },
        orderBy: { name: "asc" }
      });

      res.json({ users: users.map(sanitizeUser) });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
