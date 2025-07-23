'use client'

import { SessionProvider } from 'next-auth/react'
import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  session?: any // Session type from next-auth
}

export function Providers({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
