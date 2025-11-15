'use client';

import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const GET_ARTICLES = gql`
  query GetArticles($tenantId: ID!, $published: Boolean) {
    articles(tenantId: $tenantId, published: $published) {
      id
      title
      slug
      excerpt
      published
      createdAt
      author {
        name
        email
      }
    }
  }
`;

export default function Articles() {
  const { data: session } = useSession();
  
  // For demo purposes, using a default tenant ID
  const tenantId = '00000000-0000-0000-0000-000000000001';
  
  const { loading, error, data } = useQuery(GET_ARTICLES, {
    variables: { tenantId, published: true },
  });

  if (loading) return <div className="p-8">Loading articles...</div>;
  if (error) return <div className="p-8">Error loading articles: {error.message}</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Latest News</h1>
          <div className="flex gap-4">
            {session ? (
              <>
                <span className="text-gray-600">Welcome, {session.user?.name || session.user?.email}</span>
                <Link href="/api/auth/signout" className="text-blue-600 hover:underline">
                  Sign Out
                </Link>
              </>
            ) : (
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {data?.articles?.length === 0 ? (
            <p className="text-gray-600">No articles found.</p>
          ) : (
            data?.articles?.map((article: any) => (
              <article key={article.id} className="p-6 border rounded-lg hover:shadow-lg transition">
                <h2 className="text-2xl font-semibold mb-2">{article.title}</h2>
                {article.excerpt && (
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>By {article.author?.name || article.author?.email}</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
