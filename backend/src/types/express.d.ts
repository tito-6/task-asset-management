import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    // Lightweight auth context attached by the auth middleware
    interface UserContext {
      id: number;
      companyId: number;
      role: UserRole;
    }

    // Augment Request with the auth context
    interface Request {
      user?: UserContext;
    }
  }
}

export {};
