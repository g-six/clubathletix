import NextAuth from 'next-auth'

import { ZodError } from 'zod'
import { authConfig } from './auth.config'

import Credentials from 'next-auth/providers/credentials'
import { login } from './models/auth'
import { signInSchema } from "./lib/zod"


export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,

    providers: [Credentials({
        credentials: {
            email: {},
            password: {},
        },

        async authorize(credentials) {
            try {
                const { email, password } = await signInSchema.parseAsync(credentials)


                const results = await login(email, password)

                if (!results) {
                    throw new Error("Invalid credentials.")

                }
                const user = {
                    id: results.user_id,
                    email: results.email,
                    name: [results.last_name, results.first_name].filter(Boolean).join(', '),
                    image: results.image,
                }
                return {
                    ...results,
                    user
                }
            } catch (error) {
                if (error instanceof ZodError) {
                    // Return `null` to indicate that the credentials are invalid
                    return null
                }
            }
            return null
        },

    })],
    callbacks: {
        async session({ session: userSession, token }) {
            const [last_name, first_name] = (userSession.user.name || '').split(', ')
            return {
                expires: userSession.expires,
                user: {
                    email: userSession.user.email
                },
            }
        },
    },

})
