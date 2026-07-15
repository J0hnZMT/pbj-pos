// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma' // Adjust to relative path if not using aliases
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "shop@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.')
        }

        // Find the user in your Supabase database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('No account found with that email.')
        }

        // Check if the password matches the hashed password in the DB
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Incorrect password.')
        }

        // Return user data to establish a secure session
        return {
          id: user.id,
          email: user.email,
          name: user.role // Passing the role (ADMIN/CASHIER) inside the name field for easy access
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // JSON Web Tokens for lightning-fast stateless session validation
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Redirects users here when authentication is required
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }