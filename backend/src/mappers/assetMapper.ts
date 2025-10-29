import type { Asset, User } from "@prisma/client";
import type { AssetSummary } from "@assetmanagement/common-types";

import { decryptSecret } from "../utils/crypto.js";
import {
  fromPrismaAssetStatus,
  fromPrismaAssetType,
  fromPrismaPriority,
  fromPrismaTwoFactorStatus
} from "./enums.js";

type ResponsibleUser = Pick<User, "id" | "name" | "phone" | "email">;

export type AssetWithResponsible = Asset & {
  responsibleUser: ResponsibleUser;
};

export type AssetDetails = AssetSummary & {
  password: string;
};

export const toAssetSummary = (asset: AssetWithResponsible): AssetSummary => ({
  id: asset.id,
  companyId: asset.companyId,
  brand: asset.brand ?? undefined,
  type: fromPrismaAssetType(asset.type),
  url: asset.url,
  username: asset.username,
  email: asset.email,
  status: fromPrismaAssetStatus(asset.status),
  twoFactorStatus: fromPrismaTwoFactorStatus(asset.twoFactorStatus),
  priority: fromPrismaPriority(asset.priority),
  responsibleUser: asset.responsibleUser ? {
    id: asset.responsibleUser.id,
    name: asset.responsibleUser.name,
    phone: asset.responsibleUser.phone
  } : { id: 0, name: "N/A", phone: "N/A" }
});

export const toAssetDetails = (asset: AssetWithResponsible): AssetDetails => ({
  ...toAssetSummary(asset),
  password: decryptSecret({
    cipherText: asset.passwordEncrypted,
    iv: asset.passwordIv,
    tag: asset.passwordTag
  })
});
