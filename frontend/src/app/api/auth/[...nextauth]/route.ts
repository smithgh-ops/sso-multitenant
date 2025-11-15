import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `
                  mutation Login($input: LoginInput!) {
                    login(input: $input) {
                      token
                      user {
                        id
                        email
                        name
                        role
                      }
                    }
                  }
                `,
                variables: {
                  input: {
                    email: credentials.email,
                    password: credentials.password,
                  },
                },
              }),
            }
          );

          const data = await response.json();

          if (data.errors || !data.data?.login) {
            return null;
          }

          const { token, user } = data.data.login;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accessToken: token,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
