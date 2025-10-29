import type {
  AssetStatus,
  AssetType,
  Priority,
  TaskStatus,
  TwoFactorStatus
} from "@assetmanagement/common-types";
import {
  AssetStatus as PrismaAssetStatus,
  AssetType as PrismaAssetType,
  Priority as PrismaPriority,
  TaskStatus as PrismaTaskStatus,
  TwoFactorStatus as PrismaTwoFactorStatus
} from "@prisma/client";

const assetTypeMap: Record<PrismaAssetType, AssetType> = {
  SosyalMedya: "Sosyal Medya",
  WebSitesi: "Web Sitesi",
  Analitik: "Analitik",
  Reklam: "Reklam",
  Entegrasyon: "Entegrasyon",
  Emlak: "Emlak",
  Profesyonel: "Profesyonel"
};

const reverseAssetTypeMap = Object.fromEntries(
  Object.entries(assetTypeMap).map(([key, value]) => [value, key as PrismaAssetType])
) as Record<AssetType, PrismaAssetType>;

const twoFactorMap: Record<PrismaTwoFactorStatus, TwoFactorStatus> = {
  SMS: "SMS",
  Yok: "Yok",
  AuthenticatorApp: "Authenticator App"
};

const reverseTwoFactorMap = Object.fromEntries(
  Object.entries(twoFactorMap).map(([key, value]) => [value, key as PrismaTwoFactorStatus])
) as Record<TwoFactorStatus, PrismaTwoFactorStatus>;

const taskStatusMap: Record<PrismaTaskStatus, TaskStatus> = {
  ToDo: "To Do",
  InProgress: "In Progress",
  AwaitingConfirmation: "Awaiting Confirmation",
  Done: "Done"
};

const reverseTaskStatusMap = Object.fromEntries(
  Object.entries(taskStatusMap).map(([key, value]) => [value, key as PrismaTaskStatus])
) as Record<TaskStatus, PrismaTaskStatus>;

const assetStatusMap: Record<PrismaAssetStatus, AssetStatus> = {
  Aktif: "Aktif",
  YOK: "YOK"
};

const priorityMap: Record<PrismaPriority, Priority> = {
  High: "High",
  Medium: "Medium",
  Low: "Low"
};

export const fromPrismaAssetType = (value: PrismaAssetType): AssetType => assetTypeMap[value];

export const toPrismaAssetType = (value: AssetType | string): PrismaAssetType => {
  const mapped = reverseAssetTypeMap[value as AssetType];
  if (!mapped) {
    throw new Error(`Unsupported asset type: ${value}`);
  }
  return mapped;
};

export const fromPrismaTwoFactorStatus = (
  value: PrismaTwoFactorStatus
): TwoFactorStatus => twoFactorMap[value];

export const toPrismaTwoFactorStatus = (
  value: TwoFactorStatus | string
): PrismaTwoFactorStatus => {
  const mapped = reverseTwoFactorMap[value as TwoFactorStatus];
  if (!mapped) {
    throw new Error(`Unsupported 2FA status: ${value}`);
  }
  return mapped;
};

export const fromPrismaTaskStatus = (value: PrismaTaskStatus): TaskStatus => taskStatusMap[value];

export const toPrismaTaskStatus = (value: TaskStatus | string): PrismaTaskStatus => {
  const mapped = reverseTaskStatusMap[value as TaskStatus];
  if (!mapped) {
    throw new Error(`Unsupported task status: ${value}`);
  }
  return mapped;
};

export const fromPrismaAssetStatus = (value: PrismaAssetStatus): AssetStatus => assetStatusMap[value];

export const toPrismaAssetStatus = (value: AssetStatus | string): PrismaAssetStatus => {
  const entries = Object.entries(assetStatusMap) as Array<[PrismaAssetStatus, AssetStatus]>;
  const match = entries.find(([, display]) => display === value);
  if (!match) {
    throw new Error(`Unsupported asset status: ${value}`);
  }
  return match[0];
};

export const fromPrismaPriority = (value: PrismaPriority): Priority => priorityMap[value];

export const toPrismaPriority = (value: Priority | string): PrismaPriority => {
  const entries = Object.entries(priorityMap) as Array<[PrismaPriority, Priority]>;
  const match = entries.find(([, display]) => display === value);
  if (!match) {
    throw new Error(`Unsupported priority: ${value}`);
  }
  return match[0];
};
