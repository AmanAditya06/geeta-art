import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000/api"

export const { handlers: { GET, POST } } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          if (!res.ok) return null
          const data = await res.json()
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role.toLowerCase(),
            image: data.user.image,
            apiToken: data.token,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/account",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "user"
        token.apiToken = (user as any).apiToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).apiToken = token.apiToken
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "geeta-art-secret-key-change-in-production",
})
