import { GraphQLError } from 'graphql';
import { Context } from '../middleware/context';
import { requireAuth, requireRole } from '../middleware/auth';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export const mutationResolvers = {
  // Authentication
  register: async (
    _: any,
    { input }: { input: any },
    context: Context
  ) => {
    const { email, password, name, tenantId } = input;

    const existingUser = await context.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new GraphQLError('User already exists', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await context.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        tenantId,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });

    // Create session
    await context.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { token, user };
  },

  login: async (_: any, { input }: { input: any }, context: Context) => {
    const { email, password } = input;

    const user = await context.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });

    // Create session
    await context.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { token, user };
  },

  logout: async (_: any, __: any, context: Context) => {
    const user = requireAuth(context);
    
    if (context.token) {
      await context.prisma.session.deleteMany({
        where: {
          userId: user.id,
          token: context.token,
        },
      });
    }

    return true;
  },

  // User management
  updateUser: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: Context
  ) => {
    const user = requireAuth(context);

    if (user.id !== id && user.role !== 'ADMIN') {
      throw new GraphQLError('Not authorized', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return context.prisma.user.update({
      where: { id },
      data: input,
    });
  },

  deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
    requireRole(context, ['ADMIN']);

    await context.prisma.user.delete({
      where: { id },
    });

    return true;
  },

  // Article management
  createArticle: async (
    _: any,
    { input }: { input: any },
    context: Context
  ) => {
    const user = requireAuth(context);

    const article = await context.prisma.article.create({
      data: {
        ...input,
        authorId: user.id,
      },
    });

    return article;
  },

  updateArticle: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: Context
  ) => {
    const user = requireAuth(context);

    const article = await context.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new GraphQLError('Article not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (article.authorId !== user.id && !['EDITOR', 'ADMIN'].includes(user.role)) {
      throw new GraphQLError('Not authorized', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return context.prisma.article.update({
      where: { id },
      data: input,
    });
  },

  deleteArticle: async (_: any, { id }: { id: string }, context: Context) => {
    const user = requireAuth(context);

    const article = await context.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new GraphQLError('Article not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (article.authorId !== user.id && !['EDITOR', 'ADMIN'].includes(user.role)) {
      throw new GraphQLError('Not authorized', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await context.prisma.article.delete({
      where: { id },
    });

    return true;
  },

  publishArticle: async (_: any, { id }: { id: string }, context: Context) => {
    requireRole(context, ['EDITOR', 'ADMIN']);

    return context.prisma.article.update({
      where: { id },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });
  },

  unpublishArticle: async (_: any, { id }: { id: string }, context: Context) => {
    requireRole(context, ['EDITOR', 'ADMIN']);

    return context.prisma.article.update({
      where: { id },
      data: {
        published: false,
        publishedAt: null,
      },
    });
  },

  // Category management
  createCategory: async (
    _: any,
    { input }: { input: any },
    context: Context
  ) => {
    requireRole(context, ['EDITOR', 'ADMIN']);

    return context.prisma.category.create({
      data: input,
    });
  },

  updateCategory: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: Context
  ) => {
    requireRole(context, ['EDITOR', 'ADMIN']);

    return context.prisma.category.update({
      where: { id },
      data: input,
    });
  },

  deleteCategory: async (_: any, { id }: { id: string }, context: Context) => {
    requireRole(context, ['EDITOR', 'ADMIN']);

    await context.prisma.category.delete({
      where: { id },
    });

    return true;
  },

  // Tenant management
  createTenant: async (
    _: any,
    { input }: { input: any },
    context: Context
  ) => {
    requireRole(context, ['ADMIN']);

    return context.prisma.tenant.create({
      data: input,
    });
  },

  updateTenant: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: Context
  ) => {
    requireRole(context, ['ADMIN']);

    return context.prisma.tenant.update({
      where: { id },
      data: input,
    });
  },
};
