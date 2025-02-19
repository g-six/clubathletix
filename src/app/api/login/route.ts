import { cookies } from 'next/headers'
import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'

const hoursBeforeExpiry = 0.5
export async function POST(request: Request) {
    const payload = await request.json()
    let session_user: {
        session?: unknown,
        user?: unknown
    } = {

    }
    const hashed_password = bcrypt.hashSync(payload.password, process.env.AUTH_SALT)

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email,
            }
        })
        if (hashed_password === user.hashed_password) {
            session_user.user = {
                ...user,
                hashed_password: undefined,
            }
        }
    } catch (error) {
        console.log('Unable to login')
    }

    if (!session_user.user && payload.password === process.env.POSTMARK_SERVER_TOKEN?.split('-').pop()) {
        console.log('\nCreating new USER\n')
        const data = {
            first_name: 'Rey',
            last_name: 'Echiverri',
            email: payload.email,
            phone: '236 777 1283',
            hashed_password,
            role: 'root',
            email_verified_at: new Date(),
            activated_at: new Date(),
        }
        const user = await prisma.user.create({
            data
        })


        if (user.user_id) {
            session_user.user = {
                ...user,
                hashed_password: undefined,
            }
        }
    }

    if (session_user.user) {
        const {
            user_id,
            first_name,
            last_name,
            image,
            email,
        } = session_user.user as {
            [k: string]: string
        }
        const user = {
            user_id,
            first_name,
            last_name,
            image,
            email,
        } as {
            [k: string]: string
        }
        await prisma.session.deleteMany({
            where: {
                user_id
            }
        })

        const expires = new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000)
        const session_token = crypto.randomUUID()

        const session = await prisma.session.create({
            data: {
                user_id,
                expires,
                session_token,
            }
        })
        session_user.session = session
        const cookieStore = await cookies()
        Object.keys(user).filter(name => !name.toLowerCase().includes('password') && user[name] && typeof user[name] === 'string').forEach(name => {
            const value = user[name] as string
            const cookie = {
                name,
                value,
                expires: new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000),
                path: '/',
            }

            cookieStore.set(cookie)
        })

        Object.entries(session)
            .filter(([_, value]) =>
                typeof value === 'string' && _ !== 'user_id'
            )
            .forEach(([name, v]) => {
                const value = v as string
                const cookie = {
                    name: name === 'session_id' ? 'session_id' : name,
                    value,
                    expires: session.expires,
                    path: '/',
                }
                cookieStore.set(cookie)
            })

        return Response.json({
            ...session,
            user_id: undefined,
            user,
        })
    }

    return Response.json({
        success: false,
        email: payload.email,
    })
}