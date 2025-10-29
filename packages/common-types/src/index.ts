import { z } from "zod";

export const UserRoleEnum = z.enum([
  "admin",
  "manager",
  "agency_user",
  "employee"
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const AssetTypeEnum = z.enum([
  "Sosyal Medya",
  "Web Sitesi",
  "Analitik",
  "Reklam",
  "Entegrasyon",
  "Emlak",
  "Profesyonel"
]);
export type AssetType = z.infer<typeof AssetTypeEnum>;

export const AssetStatusEnum = z.enum(["Aktif", "YOK"]);
export type AssetStatus = z.infer<typeof AssetStatusEnum>;

export const TwoFactorStatusEnum = z.enum([
  "SMS",
  "Yok",
  "Authenticator App"
]);
export type TwoFactorStatus = z.infer<typeof TwoFactorStatusEnum>;

export const PriorityEnum = z.enum(["High", "Medium", "Low"]);
export type Priority = z.infer<typeof PriorityEnum>;

export const TaskStatusEnum = z.enum([
  "To Do",
  "In Progress",
  "Awaiting Confirmation",
  "Done"
]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const UserSafeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().min(6),
  role: UserRoleEnum,
  companyId: z.number().int()
});
export type UserSafe = z.infer<typeof UserSafeSchema>;

export const CompanySchema = z.object({
  id: z.number().int(),
  name: z.string()
});
export type Company = z.infer<typeof CompanySchema>;

export const AssetSummarySchema = z.object({
  id: z.number().int(),
  companyId: z.number().int(),
  brand: z.string().optional(),
  type: AssetTypeEnum,
  url: z.string().url(),
  username: z.string(),
  email: z.string().email(),
  status: AssetStatusEnum,
  twoFactorStatus: TwoFactorStatusEnum,
  priority: PriorityEnum,
  responsibleUser: UserSafeSchema.pick({ id: true, name: true, phone: true })
});
export type AssetSummary = z.infer<typeof AssetSummarySchema>;

export const TaskSummarySchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: TaskStatusEnum,
  createdBy: UserSafeSchema.pick({ id: true, name: true, phone: true }),
  handler: UserSafeSchema.pick({ id: true, name: true, phone: true }),
  assetId: z.number().int().nullable(),
  dueDate: z.string().nullable(),
  files: z.array(z.string()).default([])
});
export type TaskSummary = z.infer<typeof TaskSummarySchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSafeSchema
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const ApiErrorSchema = z.object({
  message: z.string()
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
