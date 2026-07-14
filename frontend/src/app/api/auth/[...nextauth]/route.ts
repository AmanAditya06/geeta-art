import { NextRequest } from "next/server"

let handlers: { GET: Function; POST: Function } | null = null

async function getHandlers() {
  if (!handlers) {
    const { default: NextAuth } = await import("next-auth")
    const { default: Credentials } = await import("next-auth/providers/credentials")
    
    const API_URL = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api`
      : process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/api`
        : "http://localhost:3000/api"

    handlers = NextAuth({
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
                body: JSON.stringify({ email: credentials.email, password: credentials.password }),
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
      session: { strategy: "jwt" },
      pages: { signIn: "/account" },
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
    }).handlers
  }
  return handlers
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  const h = await getHandlers()
  return (h.GET as Function)(request, { params })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  const h = await getHandlers()
  return (h.POST as Function)(request, { params })
}
