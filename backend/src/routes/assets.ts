import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import {
  AssetStatusEnum,
  AssetTypeEnum,
  PriorityEnum,
  TwoFactorStatusEnum
} from "@assetmanagement/common-types";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { notifyPasswordChanged } from "../services/notificationService.js";
import { encryptSecret } from "../utils/crypto.js";
import {
  toPrismaAssetStatus,
  toPrismaAssetType,
  toPrismaPriority,
  toPrismaTwoFactorStatus
} from "../mappers/enums.js";
import { toAssetDetails, toAssetSummary } from "../mappers/assetMapper.js";

const router = Router();

const notificationUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true
} as const;

const assetCreateSchema = z.object({
  companyId: z.number().int(),
  brand: z.string().optional(),
  type: AssetTypeEnum,
  url: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
  responsibleUserId: z.number().int().optional(),
  email: z.string().email(),
  status: AssetStatusEnum,
  twoFactorStatus: TwoFactorStatusEnum,
  priority: PriorityEnum
});

const assetUpdateSchema = z.object({
  brand: z.string().optional(),
  type: AssetTypeEnum.optional(),
  url: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  responsibleUserId: z.number().int().optional(),
  email: z.string().optional(),
  status: AssetStatusEnum.optional(),
  twoFactorStatus: TwoFactorStatusEnum.optional(),
  priority: PriorityEnum.optional()
});

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

      const assets = await prisma.asset.findMany({
        where: { companyId },
        include: {
          responsibleUser: {
            select: notificationUserSelect
          }
        },
        orderBy: { updatedAt: "desc" }
      });

      res.json({ assets: assets.map(toAssetSummary) });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const parsed = assetCreateSchema.parse(req.body);

    if (req.user.companyId !== parsed.companyId && req.user.role !== "admin") {
      res.status(403).json({ message: "Cannot create asset for another company" });
      return;
    }

    // Validate responsible user if provided
    if (parsed.responsibleUserId) {
      const responsible = await prisma.user.findUnique({
        where: { id: parsed.responsibleUserId },
        select: { id: true, name: true, phone: true, companyId: true }
      });

      if (!responsible || responsible.companyId !== parsed.companyId) {
        res.status(400).json({ message: "Responsible user must belong to the same company" });
        return;
      }
    }

    const encrypted = encryptSecret(parsed.password);

    const asset = await prisma.asset.create({
      data: {
        companyId: parsed.companyId,
        brand: parsed.brand,
        type: toPrismaAssetType(parsed.type),
        url: parsed.url,
        username: parsed.username,
        passwordEncrypted: encrypted.cipherText,
        passwordIv: encrypted.iv,
        passwordTag: encrypted.tag,
        responsibleUserId: parsed.responsibleUserId,
        email: parsed.email,
        status: toPrismaAssetStatus(parsed.status),
        twoFactorStatus: toPrismaTwoFactorStatus(parsed.twoFactorStatus),
        priority: toPrismaPriority(parsed.priority)
      },
      include: {
        responsibleUser: { select: notificationUserSelect }
      }
    });

    res.status(201).json({ asset: toAssetSummary(asset) });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:assetId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);
      if (Number.isNaN(assetId)) {
        res.status(400).json({ message: "Invalid asset id" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          responsibleUser: { select: notificationUserSelect }
        }
      });

      if (!asset) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      if (req.user.companyId !== asset.companyId && req.user.role !== "admin") {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json({ asset: toAssetDetails(asset) });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:assetId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);
      if (Number.isNaN(assetId)) {
        res.status(400).json({ message: "Invalid asset id" });
        return;
      }

      const existing = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          responsibleUser: { select: notificationUserSelect }
        }
      });

      if (!existing) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      if (req.user.companyId !== existing.companyId && req.user.role !== "admin") {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      console.log("Received update request body:", JSON.stringify(req.body, null, 2));
      
      const parsed = assetUpdateSchema.parse(req.body);
      
      console.log("Parsed data:", JSON.stringify(parsed, null, 2));

      let passwordChanged = false;
      let responsibleUserId = existing.responsibleUserId;

      if (parsed.responsibleUserId) {
        const responsible = await prisma.user.findUnique({
          where: { id: parsed.responsibleUserId },
          select: { id: true, name: true, phone: true, companyId: true }
        });

        if (!responsible || responsible.companyId !== existing.companyId) {
          res
            .status(400)
            .json({ message: "Responsible user must belong to the same company" });
          return;
        }

        responsibleUserId = responsible.id;
      }

      const updateData: Record<string, unknown> = {};

      if (parsed.brand !== undefined) {
        updateData.brand = parsed.brand;
      }

      if (parsed.type) {
        updateData.type = toPrismaAssetType(parsed.type);
      }

      if (parsed.url !== undefined) {
        updateData.url = parsed.url;
      }

      if (parsed.username !== undefined) {
        updateData.username = parsed.username;
      }

      if (parsed.password) {
        const encrypted = encryptSecret(parsed.password);
        updateData.passwordEncrypted = encrypted.cipherText;
        updateData.passwordIv = encrypted.iv;
        updateData.passwordTag = encrypted.tag;
        passwordChanged = true;
      }

      if (parsed.email !== undefined) {
        updateData.email = parsed.email;
      }

      if (parsed.status) {
        updateData.status = toPrismaAssetStatus(parsed.status);
      }

      if (parsed.twoFactorStatus) {
        updateData.twoFactorStatus = toPrismaTwoFactorStatus(parsed.twoFactorStatus);
      }

      if (parsed.priority) {
        updateData.priority = toPrismaPriority(parsed.priority);
      }

      if (parsed.responsibleUserId) {
        updateData.responsibleUserId = responsibleUserId;
      }

      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: updateData,
        include: {
          responsibleUser: { select: notificationUserSelect }
        }
      });

      if (passwordChanged) {
        await prisma.passwordChangeLog.create({
          data: {
            assetId: updated.id,
            changedById: req.user.id
          }
        });

        const changer = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { name: true, phone: true, email: true }
        });

        if (
          changer &&
          changer.email &&
          updated.responsibleUser &&
          updated.responsibleUser.phone &&
          updated.responsibleUser.email
        ) {
          await notifyPasswordChanged(
            {
              name: updated.responsibleUser.name,
              phone: updated.responsibleUser.phone,
              email: updated.responsibleUser.email
            },
            {
              name: changer.name,
              phone: changer.phone,
              email: changer.email
            },
            {
              url: updated.url,
              username: updated.username
            }
          );
        }
      }

      res.json({ asset: toAssetSummary(updated) });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:assetId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assetId = Number.parseInt(req.params.assetId, 10);
      if (Number.isNaN(assetId)) {
        res.status(400).json({ message: "Invalid asset id" });
        return;
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          responsibleUser: { select: notificationUserSelect }
        }
      });

      if (!asset) {
        res.status(404).json({ message: "Asset not found" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      if (req.user.companyId !== asset.companyId && req.user.role !== "admin") {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json({ asset: toAssetDetails(asset) });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /assets/:id - Delete an asset
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const assetId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(assetId)) {
      res.status(400).json({ message: "Invalid asset ID" });
      return;
    }

    const existing = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { companyId: true }
    });

    if (!existing) {
      res.status(404).json({ message: "Asset not found" });
      return;
    }

    // Check if user belongs to the same company or is admin
    if (existing.companyId !== req.user.companyId && req.user.role !== "admin") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await prisma.asset.delete({
      where: { id: assetId }
    });

    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
