import { Context } from '../middleware/context';

export const typeResolvers = {
  User: {
    tenant: async (parent: any, _: any, context: Context) => {
      return context.prisma.tenant.findUnique({
        where: { id: parent.tenantId },
      });
    },
    articles: async (parent: any, _: any, context: Context) => {
      return context.prisma.article.findMany({
        where: { authorId: parent.id },
      });
    },
  },

  Tenant: {
    users: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findMany({
        where: { tenantId: parent.id },
      });
    },
    articles: async (parent: any, _: any, context: Context) => {
      return context.prisma.article.findMany({
        where: { tenantId: parent.id },
      });
    },
    categories: async (parent: any, _: any, context: Context) => {
      return context.prisma.category.findMany({
        where: { tenantId: parent.id },
      });
    },
  },

  Article: {
    tenant: async (parent: any, _: any, context: Context) => {
      return context.prisma.tenant.findUnique({
        where: { id: parent.tenantId },
      });
    },
    author: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.authorId },
      });
    },
    category: async (parent: any, _: any, context: Context) => {
      if (!parent.categoryId) return null;
      return context.prisma.category.findUnique({
        where: { id: parent.categoryId },
      });
    },
  },

  Category: {
    tenant: async (parent: any, _: any, context: Context) => {
      return context.prisma.tenant.findUnique({
        where: { id: parent.tenantId },
      });
    },
    articles: async (parent: any, _: any, context: Context) => {
      return context.prisma.article.findMany({
        where: { categoryId: parent.id },
      });
    },
  },
};
