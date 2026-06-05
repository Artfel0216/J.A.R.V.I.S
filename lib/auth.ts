import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Login',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email ?? ''
        const rawPassword = credentials?.password ?? ''
        const email = String(rawEmail).toLowerCase().trim()
        const password = String(rawPassword)

        if (!email || !password) return null

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          const hashedPassword = await hash(password, 10)
          user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: email.split('@')[0],
            },
          })
        } else {
          if (!user.password) return null
          const isValidPassword = await compare(password, user.password)
          if (!isValidPassword) return null
        }

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
})
