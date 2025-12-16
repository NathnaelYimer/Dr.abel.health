import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "./prisma"
import { customPrismaAdapter } from "./custom-prisma-adapter"

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter(prisma),
  providers: (() => {
    const providers: any[] = []

    // Only add Google provider when credentials are configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push(
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            }
          }
        })
      )
    }

    // Email provider is safe to add; default to empty values if missing
    providers.push(
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST || '',
          port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
          auth: {
            user: process.env.EMAIL_SERVER_USER || '',
            pass: process.env.EMAIL_SERVER_PASSWORD || '',
          },
        },
        from: process.env.EMAIL_FROM || 'noreply@drabelhealthconsulting.org',
      })
    )

    return providers
  })(),
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        })
        session.user.role = user?.role || "VIEWER"
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
