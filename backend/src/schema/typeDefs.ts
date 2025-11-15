import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    me: User
    users(tenantId: ID!): [User!]!
    user(id: ID!): User
    
    articles(tenantId: ID!, published: Boolean): [Article!]!
    article(id: ID!): Article
    articleBySlug(tenantId: ID!, slug: String!): Article
    
    categories(tenantId: ID!): [Category!]!
    category(id: ID!): Category
    
    tenant(id: ID!): Tenant
    tenantBySlug(slug: String!): Tenant
  }

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    
    # User management
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Article management
    createArticle(input: CreateArticleInput!): Article!
    updateArticle(id: ID!, input: UpdateArticleInput!): Article!
    deleteArticle(id: ID!): Boolean!
    publishArticle(id: ID!): Article!
    unpublishArticle(id: ID!): Article!
    
    # Category management
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    
    # Tenant management
    createTenant(input: CreateTenantInput!): Tenant!
    updateTenant(id: ID!, input: UpdateTenantInput!): Tenant!
  }

  type User {
    id: ID!
    email: String!
    name: String
    role: Role!
    tenant: Tenant!
    articles: [Article!]!
    createdAt: String!
    updatedAt: String!
  }

  enum Role {
    USER
    EDITOR
    ADMIN
  }

  type Tenant {
    id: ID!
    name: String!
    slug: String!
    domain: String
    users: [User!]!
    articles: [Article!]!
    categories: [Category!]!
    createdAt: String!
    updatedAt: String!
  }

  type Article {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    published: Boolean!
    tenant: Tenant!
    author: User!
    category: Category
    createdAt: String!
    updatedAt: String!
    publishedAt: String
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    tenant: Tenant!
    articles: [Article!]!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String
    tenantId: ID!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    email: String
    name: String
    role: Role
  }

  input CreateArticleInput {
    title: String!
    slug: String!
    content: String!
    excerpt: String
    tenantId: ID!
    categoryId: ID
    published: Boolean
  }

  input UpdateArticleInput {
    title: String
    slug: String
    content: String
    excerpt: String
    categoryId: ID
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
    tenantId: ID!
  }

  input UpdateCategoryInput {
    name: String
    slug: String
  }

  input CreateTenantInput {
    name: String!
    slug: String!
    domain: String
  }

  input UpdateTenantInput {
    name: String
    slug: String
    domain: String
  }
`;
