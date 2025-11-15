import { GraphQLError } from 'graphql';
import { Context } from '../middleware/context';

export const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
};

export const requireRole = (context: Context, allowedRoles: string[]) => {
  const user = requireAuth(context);
  if (!allowedRoles.includes(user.role)) {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};

export const requireTenantAccess = (context: Context, tenantId: string) => {
  const user = requireAuth(context);
  if (user.tenantId !== tenantId && user.role !== 'ADMIN') {
    throw new GraphQLError('Not authorized to access this tenant', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};
