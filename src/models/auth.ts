import { auth } from '@/auth'
import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from './user'
import { SessionUser } from '@/typings/user'

export async function getAuthForOperation(): Promise<SessionUser> {
    const session = await auth()
    if (!session?.user?.email) throw new Error('Unauthorized')

    const user = await getUserByEmail(session.user.email)
    if (!user) throw new Error('Unauthorized')

    return user
}
export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })
    if (user) {

        const hashed_password = bcrypt.hashSync(password, process.env.AUTH_SALT)
        const password_reset_token = bcrypt.hashSync(password, process.env.AUTH_SALT)

        if (hashed_password === user.hashed_password) {
            return {
                ...user,
                password_reset_token: undefined,
                hashed_password: undefined,
            }
        } else if (password_reset_token === user.password_reset_token) {
            await prisma.user.update({
                where: {
                    email,
                },
                data: {
                    password_reset_token: null,
                }
            })
            return {
                ...user,
                password_reset_token: undefined,
                hashed_password: undefined,
            }
        }

    }

    console.log('Invalid credentials')
    return null
}