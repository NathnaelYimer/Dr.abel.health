import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Extend the Prisma client to include our custom models
export interface CustomPrismaClient extends PrismaClient {
  tag: {
    findMany: (args: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any | null>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
    count: (args?: any) => Promise<number>
  }
}

const prisma: CustomPrismaClient = global.prisma || new PrismaClient() as unknown as CustomPrismaClient

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma }
