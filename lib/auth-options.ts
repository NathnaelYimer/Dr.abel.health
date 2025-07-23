import { NextAuthOptions, Account, Profile } from "next-auth"

type NextAuthUser = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: string;
  bio?: string;
  status: string;
  lastActive?: Date;
  emailVerified?: boolean;
}
import type { JWT as JWTType } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import { compare } from "bcryptjs"
import { Adapter, AdapterUser } from "next-auth/adapters"
import { Role, UserStatus, User as PrismaUser } from "@prisma/client"

// Types are now defined in types/next-auth.d.ts

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: Role
    bio?: string | null
    status: UserStatus
    lastActive?: Date | null
    emailVerified?: Date | null
  }
}

// Type for user with password (only used during authentication)
type UserWithPassword = Omit<PrismaUser, 'password'> & {
  password: string
}

export const authOptions: NextAuthOptions = {
  // @ts-ignore - PrismaAdapter has a type issue with the latest versions
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user with password using Prisma's raw query
          const userWithPassword = await prisma.$queryRaw<Array<{
            id: string
            email: string
            name: string | null
            password: string
            role: Role
            bio: string | null
            status: UserStatus
            lastActive: Date | null
            emailVerified: Date | null
            image: string | null
          }>>`
            SELECT * FROM "User" WHERE email = ${credentials.email} LIMIT 1
          `;

          const user = userWithPassword[0];
          if (!user?.password) {
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          // Return user object without the password
          const { password: _, ...userWithoutPassword } = user;
          
          // Create a user object that matches NextAuth's User type
          return {
            id: userWithoutPassword.id,
            name: userWithoutPassword.name ?? 'User', // Default to 'User' if name is null/undefined
            email: userWithoutPassword.email ?? 'no-email@example.com', // Default email if null/undefined
            image: userWithoutPassword.image ?? '/images/avatar-placeholder.png', // Default avatar if null/undefined
            emailVerified: !!userWithoutPassword.emailVerified,
            // Add custom properties to the user object
            ...(userWithoutPassword.role && { role: userWithoutPassword.role }),
            ...(userWithoutPassword.bio && { bio: userWithoutPassword.bio }),
            ...(userWithoutPassword.status && { status: userWithoutPassword.status }),
            ...(userWithoutPassword.lastActive && { lastActive: userWithoutPassword.lastActive })
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as NextAuthUser & { 
          role: Role; 
          status: UserStatus; 
          bio?: string | null; 
          lastActive?: Date | null;
          emailVerified?: Date | null;
        };
        
        return {
          ...token,
          id: u.id,
          name: u.name ?? null,
          email: u.email ?? null,
          image: u.image ?? null,
          role: u.role,
          bio: u.bio ?? null,
          status: u.status,
          lastActive: u.lastActive ?? null,
          emailVerified: u.emailVerified ?? null
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name ?? null,
          email: token.email ?? null,
          image: token.image ?? null,
          role: token.role as Role,
          bio: token.bio ?? null,
          status: token.status as UserStatus,
          lastActive: token.lastActive ?? null,
          emailVerified: token.emailVerified ?? null
        },
      }
    },
  },
}
