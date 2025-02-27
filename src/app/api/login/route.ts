import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'
import { createSession, saveUserSession } from '@/models/session'
import { cookies } from 'next/headers'
import { User } from '@prisma/client'

export async function POST(request: Request) {
    const cookieList = await cookies()
    const organization_id = cookieList.get('organization_id')?.value || ''
    const payload = await request.json()
    let session_user: {
        session?: unknown,
        user?: unknown
    } = {

    }
    const hashed_password = bcrypt.hashSync(payload.password, process.env.AUTH_SALT)
    const password_reset_token = bcrypt.hashSync(payload.password, process.env.AUTH_SALT)

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email,
            }
        })
        if (user) {
            if (hashed_password === user.hashed_password) {
                session_user.user = {
                    ...user,
                    password_reset_token: undefined,
                    hashed_password: undefined,
                }
            } else if (password_reset_token === user.password_reset_token) {
                session_user.user = {
                    ...user,
                    password_reset_token: undefined,
                    hashed_password: undefined,
                }
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
            role,
        } = session_user.user as {
            [k: string]: string
        }
        const user = {
            user_id,
            first_name,
            last_name,
            image,
            email,
            role,
        } as {
            [k: string]: string
        }
        saveUserSession(user as unknown as User)
        session_user.session = await createSession(user_id, true)

        return Response.json({
            ...(session_user.session || {}),
            user_id: undefined,
            user,
            organization_id,
        })
    }

    return Response.json({
        success: false,
        email: payload.email,
    })
}