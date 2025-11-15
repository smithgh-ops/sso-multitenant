import { Context } from '../middleware/context';
import { requireAuth } from '../middleware/auth';

export const queryResolvers = {
  me: async (_: any, __: any, context: Context) => {
    return requireAuth(context);
  },

  users: async (_: any, { tenantId }: { tenantId: string }, context: Context) => {
    requireAuth(context);
    return context.prisma.user.findMany({
      where: { tenantId },
    });
  },

  user: async (_: any, { id }: { id: string }, context: Context) => {
    requireAuth(context);
    return context.prisma.user.findUnique({
      where: { id },
    });
  },

  articles: async (
    _: any,
    { tenantId, published }: { tenantId: string; published?: boolean },
    context: Context
  ) => {
    const where: any = { tenantId };
    if (published !== undefined) {
      where.published = published;
    }
    return context.prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  article: async (_: any, { id }: { id: string }, context: Context) => {
    return context.prisma.article.findUnique({
      where: { id },
    });
  },

  articleBySlug: async (
    _: any,
    { tenantId, slug }: { tenantId: string; slug: string },
    context: Context
  ) => {
    return context.prisma.article.findUnique({
      where: {
        slug_tenantId: {
          slug,
          tenantId,
        },
      },
    });
  },

  categories: async (_: any, { tenantId }: { tenantId: string }, context: Context) => {
    return context.prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  },

  category: async (_: any, { id }: { id: string }, context: Context) => {
    return context.prisma.category.findUnique({
      where: { id },
    });
  },

  tenant: async (_: any, { id }: { id: string }, context: Context) => {
    return context.prisma.tenant.findUnique({
      where: { id },
    });
  },

  tenantBySlug: async (_: any, { slug }: { slug: string }, context: Context) => {
    return context.prisma.tenant.findUnique({
      where: { slug },
    });
  },
};
