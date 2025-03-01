import NextAuth from "next-auth"


declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface User {
        name: string
        id: string
        image?: string
    }
    interface Session {
        user: User
    }
}