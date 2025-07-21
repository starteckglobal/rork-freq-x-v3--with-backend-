import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import jwt from 'jsonwebtoken';

// Admin user types
export type AdminRole = 'super_admin' | 'moderator' | 'customer_support' | 'content_reviewer';

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
  permissions: string[];
}

// Mock admin users database (in production, use real database)
const ADMIN_USERS: Record<string, { password: string; user: AdminUser }> = {
  'admin': {
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      role: 'super_admin',
      permissions: [
        'user_management:view', 'user_management:edit', 'user_management:ban', 'user_management:delete',
        'content_moderation:approve', 'content_moderation:reject', 'content_moderation:flag',
        'payment_management:view', 'payment_management:process', 'payment_management:dispute',
        'system_controls:restart', 'system_controls:maintenance', 'system_controls:backup',
        'analytics:view', 'analytics:export',
        'synclab:manage', 'synclab:create', 'synclab:delete'
      ]
    }
  },
  'masterfreq': {
    password: 'freq2007',
    user: {
      id: '2',
      username: 'masterfreq',
      role: 'super_admin',
      permissions: [
        'user_management:view', 'user_management:edit', 'user_management:ban', 'user_management:delete',
        'content_moderation:approve', 'content_moderation:reject', 'content_moderation:flag',
        'payment_management:view', 'payment_management:process', 'payment_management:dispute',
        'system_controls:restart', 'system_controls:maintenance', 'system_controls:backup',
        'analytics:view', 'analytics:export',
        'synclab:manage', 'synclab:create', 'synclab:delete'
      ]
    }
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'freq-admin-secret-key-2024';

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let adminUser: AdminUser | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userData = ADMIN_USERS[decoded.username];
      if (userData) {
        adminUser = userData.user;
      }
    } catch (error) {
      // Invalid token, user remains null
    }
  }

  return {
    req: opts.req,
    adminUser,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === 'BAD_REQUEST' && error.cause ? error.cause : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Admin authentication middleware
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.adminUser) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Admin authentication required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser: ctx.adminUser,
    },
  });
});

// Permission-based middleware
export const requirePermission = (permission: string) => {
  return adminProcedure.use(async ({ ctx, next }) => {
    if (!ctx.adminUser.permissions.includes(permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Permission required: ${permission}`,
      });
    }

    return next({ ctx });
  });
};

// Export admin users for login
export { ADMIN_USERS, JWT_SECRET };

// Legacy protected procedure for backward compatibility
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
    },
  });
});