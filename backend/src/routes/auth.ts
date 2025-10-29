import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { UserRoleEnum } from "@assetmanagement/common-types";

import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../utils/jwt.js";
import { sanitizeUser } from "../utils/sanitizers.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(6),
  role: UserRoleEnum.default("employee"),
  companyId: z.number().int()
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash: hashedPassword,
        phone: payload.phone,
        role: payload.role,
        companyId: payload.companyId
      }
    });

    const token = signAccessToken({ userId: user.id });

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signAccessToken({ userId: user.id });
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
