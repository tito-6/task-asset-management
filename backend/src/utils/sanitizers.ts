import type { User } from "@prisma/client";
import type { UserSafe } from "@assetmanagement/common-types";

export const sanitizeUser = (user: User): UserSafe => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  companyId: user.companyId
});
