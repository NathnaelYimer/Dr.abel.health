import { Prisma, PrismaClient, type Account, type User, type Session, type VerificationToken, type Role, type UserStatus } from '@prisma/client';
import type { Adapter, AdapterUser as BaseAdapterUser, AdapterSession, VerificationToken as NextAuthVerificationToken, AdapterAccount, AdapterUser } from 'next-auth/adapters';

// Extend the NextAuth AdapterUser type to include our custom fields
declare module 'next-auth/adapters' {
  interface AdapterUser {
    status: UserStatus;
    role: Role;
  }
}

// Helper type to handle the emailVerified field
type EmailVerified = Date | boolean | null;

/**
 * Converts various input types to a boolean for Prisma's emailVerified field
 * - Returns false for explicit false
 * - Returns true and sets a timestamp for truthy values
 * - Returns null for falsy values (except false)
 */
const toPrismaEmailVerified = (value: unknown): boolean | Date | null => {
  if (value === false) return false;
  if (!value) return null;
  // For dates or date strings, return the date
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  // For any other truthy value, return current date
  return new Date();
};

/**
 * Converts to AdapterUser's emailVerified (Date | null)
 * - Returns null for falsy values
 * - Returns Date for valid date inputs
 * - Returns current date for other truthy values
 */
const toAdapterEmailVerified = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
};

// Our extended user type that matches our Prisma schema
type ExtendedUser = Omit<BaseAdapterUser, 'name' | 'image'> & {
  status: UserStatus;
  role: Role;
  image?: string | null;
  name?: string | null | undefined;
};

type AdapterAccountType = Omit<AdapterAccount, 'type'> & {
  type: string;
};

// Helper types for Prisma input
type UserCreateInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

// Helper function to convert Prisma User to AdapterUser
function toAdapterUser(user: User): AdapterUser {
  // Map our UserStatus to the expected NextAuth status format
  const mapStatus = (status?: UserStatus): UserStatus => {
    if (!status) return 'ACTIVE';
    return status;
  };

  // Create a base user object with required fields
  const adapterUser: ExtendedUser = {
    id: user.id,
    email: user.email,
    emailVerified: toAdapterEmailVerified(user.emailVerified),
    name: user.name || '', // Ensure name is always a string
    image: user.image || null,
    role: user.role || 'VIEWER',
    status: mapStatus(user.status as UserStatus) || 'ACTIVE'
  };

  // Cast to AdapterUser which now includes our extended fields
  return adapterUser as unknown as AdapterUser;
}

// Helper function to convert Prisma Session to AdapterSession
function toAdapterSession(session: Session): AdapterSession {
  return {
    sessionToken: session.sessionToken,
    userId: session.userId,
    expires: session.expires,
  };
}

// Helper function to convert Prisma VerificationToken to NextAuth VerificationToken
function toNextAuthVerificationToken(
  token: VerificationToken
): NextAuthVerificationToken {
  return {
    identifier: token.identifier,
    token: token.token,
    expires: token.expires,
  };
}

export function customPrismaAdapter(prisma: PrismaClient): Adapter {
  if (!prisma) {
    throw new Error('Prisma client is required');
  }

  return {
    async createUser(data: Omit<AdapterUser, 'id'>) {
      const emailVerified = toPrismaEmailVerified(data.emailVerified);
      
      // Prepare user data with proper typing
      const userData: Prisma.UserCreateInput = {
        email: data.email,
        name: data.name || '',
        image: data.image || null,
        role: 'VIEWER',
        status: 'ACTIVE',
      };
      
      // Handle emailVerified separately to ensure correct typing
      if (emailVerified !== null) {
        userData.emailVerified = emailVerified === false ? false : true;
      }

      const user = await prisma.user.create({
        data: userData,
      });
      return toAdapterUser(user);
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? toAdapterUser(user) : null;
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? toAdapterUser(user) : null;
    },
    async updateUser(userData: Partial<AdapterUser> & { id: string }) {
      const updateData: Prisma.UserUpdateInput = {};
      
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.name !== undefined) updateData.name = userData.name || '';
      if (userData.image !== undefined) updateData.image = userData.image;
      if (userData.emailVerified !== undefined) {
        const emailVerified = toPrismaEmailVerified(userData.emailVerified);
        // For updates, we'll just use boolean values
        updateData.emailVerified = emailVerified !== null && emailVerified !== false;
      }
      if ('status' in userData) updateData.status = userData.status || 'ACTIVE';
      if ('role' in userData) updateData.role = userData.role || 'VIEWER';
      
      const user = await prisma.user.update({
        where: { id: userData.id },
        data: updateData,
      });
      return toAdapterUser(user);
    },
    async deleteUser(id: string) {
      // Delete related records first to maintain referential integrity
      await prisma.account.deleteMany({ where: { userId: id } });
      await prisma.session.deleteMany({ where: { userId: id } });
      
      const user = await prisma.user.delete({ 
        where: { id } 
      });
      return toAdapterUser(user);
    },
    // @ts-ignore - Required by NextAuth but not part of the Adapter type
    async createAccount(data: AdapterAccount) {
      const accountData = {
        user: {
          connect: { id: data.userId }
        },
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: 'refresh_token' in data ? data.refresh_token : null,
        access_token: 'access_token' in data ? data.access_token : null,
        expires_at: 'expires_at' in data ? data.expires_at : null,
        token_type: 'token_type' in data ? data.token_type : null,
        scope: 'scope' in data ? data.scope : null,
        id_token: 'id_token' in data ? data.id_token : null,
        session_state: 'session_state' in data ? data.session_state : null,
      } as const;

      const account = await prisma.account.create({
        data: accountData,
        select: {
          id: true,
          userId: true,
          type: true,
          provider: true,
          providerAccountId: true,
          refresh_token: true,
          access_token: true,
          expires_at: true,
          token_type: true,
          scope: true,
          id_token: true,
          session_state: true,
        }
      });
      
      // Convert to AdapterAccount format
      const { userId, ...accountWithoutUserId } = account;
      return {
        ...accountWithoutUserId,
        userId: userId,
      } as unknown as AdapterAccount;
    },
    async linkAccount(account: AdapterAccount) {
      const { userId, ...accountData } = account;
      
      // Create the account data with proper typing
      const accountCreateInput: Prisma.AccountCreateInput = {
        user: {
          connect: { id: userId }
        },
        type: accountData.type,
        provider: accountData.provider,
        providerAccountId: accountData.providerAccountId,
        refresh_token: 'refresh_token' in accountData ? accountData.refresh_token : null,
        access_token: 'access_token' in accountData ? accountData.access_token : null,
        expires_at: 'expires_at' in accountData ? accountData.expires_at : null,
        token_type: 'token_type' in accountData ? accountData.token_type : null,
        scope: 'scope' in accountData ? accountData.scope : null,
        id_token: 'id_token' in accountData ? accountData.id_token : null,
        session_state: 'session_state' in accountData ? accountData.session_state : null,
      };
      
      const createdAccount = await prisma.account.create({
        data: accountCreateInput,
        select: {
          id: true,
          type: true,
          provider: true,
          providerAccountId: true,
          refresh_token: true,
          access_token: true,
          expires_at: true,
          token_type: true,
          scope: true,
          id_token: true,
          session_state: true,
        }
      });
      
      return createdAccount as unknown as AdapterAccount;
    },
    async getAccount(provider: string, providerAccountId: string) {
      return await prisma.account.findFirst({
        where: { provider, providerAccountId },
      });
    },
    async getAccountByUserId(userId: string) {
      return await prisma.account.findFirst({
        where: { userId },
      });
    },
    async updateAccount(provider: string, providerAccountId: string, data: Partial<Omit<Account, 'id' | 'userId' | 'provider' | 'providerAccountId'>>) {
      return await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        data,
      });
    },
    async deleteAccount(provider: string, providerAccountId: string) {
      return await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },
    async createSession(data: { sessionToken: string; userId: string; expires: Date }) {
      const session = await prisma.session.create({
        data: {
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
        },
      });
      return toAdapterSession(session);
    },
    async getSession(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
      });
      return session ? toAdapterSession(session) : null;
    },
    async updateSession(sessionData: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      const session = await prisma.session.update({
        where: { sessionToken: sessionData.sessionToken },
        data: {
          expires: sessionData.expires,
          userId: sessionData.userId,
        },
      });
      return toAdapterSession(session);
    },
    async deleteSession(sessionToken: string) {
      return await prisma.session.delete({
        where: { sessionToken },
      });
    },
    async createVerificationToken(data: NextAuthVerificationToken) {
      const token = await prisma.verificationToken.create({
        data: {
          identifier: data.identifier,
          token: data.token,
          expires: data.expires,
        },
      });
      return toNextAuthVerificationToken(token);
    },
    async getVerificationToken(identifier: string, token: string) {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier, token } },
      });
      return verificationToken ? toNextAuthVerificationToken(verificationToken) : null;
    },
    async deleteVerificationToken(identifier: string, token: string) {
      return await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token } },
      });
    },
    // Required by NextAuth.js for email verification
    async useVerificationToken(params: { identifier: string; token: string }) {
      try {
        const token = await prisma.verificationToken.findUnique({
          where: { identifier_token: { identifier: params.identifier, token: params.token } },
        });

        if (!token) {
          return null;
        }

        // Delete the token after it's been used
        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier: params.identifier, token: params.token } },
        });

        return toNextAuthVerificationToken(token);
      } catch (error) {
        // If token doesn't exist or already used, return null
        return null;
      }
    },
  };
}
