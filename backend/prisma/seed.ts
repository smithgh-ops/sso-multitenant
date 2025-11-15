import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-news' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo News Organization',
      slug: 'demo-news',
      domain: 'demo.news.local',
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.news' },
    update: {},
    create: {
      email: 'admin@demo.news',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create editor user
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@demo.news' },
    update: {},
    create: {
      email: 'editor@demo.news',
      name: 'Editor User',
      password: hashedPassword,
      role: 'EDITOR',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created editor user:', editorUser.email);

  // Create categories
  const categories = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: {
        slug_tenantId: {
          slug: cat.slug,
          tenantId: tenant.id,
        },
      },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        tenantId: tenant.id,
      },
    });
    console.log('✅ Created category:', cat.name);
  }

  // Create sample articles
  const techCategory = await prisma.category.findUnique({
    where: {
      slug_tenantId: {
        slug: 'technology',
        tenantId: tenant.id,
      },
    },
  });

  const articles = [
    {
      title: 'Welcome to Multi-Tenant News Platform',
      slug: 'welcome-to-platform',
      content: 'This is a demonstration of a multi-tenant news platform with SSO authentication. Each tenant has isolated data and can manage their own content.',
      excerpt: 'Introduction to the multi-tenant news platform',
      published: true,
    },
    {
      title: 'Getting Started with GraphQL',
      slug: 'getting-started-graphql',
      content: 'GraphQL is a query language for APIs that provides a complete and understandable description of the data in your API.',
      excerpt: 'Learn the basics of GraphQL',
      published: true,
    },
    {
      title: 'Building Scalable Applications',
      slug: 'building-scalable-apps',
      content: 'Multi-tenant architecture allows you to serve multiple customers from a single instance of your application, reducing costs and maintenance overhead.',
      excerpt: 'Best practices for multi-tenant architecture',
      published: false,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: {
        slug_tenantId: {
          slug: article.slug,
          tenantId: tenant.id,
        },
      },
      update: {},
      create: {
        ...article,
        tenantId: tenant.id,
        authorId: editorUser.id,
        categoryId: techCategory?.id,
        publishedAt: article.published ? new Date() : null,
      },
    });
    console.log('✅ Created article:', article.title);
  }

  console.log('🎉 Database seed completed!');
  console.log('\n📝 Demo credentials:');
  console.log('Admin: admin@demo.news / admin123');
  console.log('Editor: editor@demo.news / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
