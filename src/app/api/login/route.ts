import type { NextApiRequest, NextApiResponse } from 'next'
import { cookies } from 'next/headers'
import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'

const hoursBeforeExpiry = 0.5
export async function POST(request: Request) {
    const payload = await request.json()
    const hashed_password = bcrypt.hashSync(payload.password, process.env.AUTH_SALT)

    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
        include: {
            sessions: true
        }
    })
    const success = user ? hashed_password === user.hashed_password : false

    if (success) {
        await prisma.session.deleteMany({
            where: {
                userId: user.id
            }
        })
        const {
            id: userId,
            name,
            image,
            updatedAt,
        } = user

        const expires = new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000)
        const sessionToken = crypto.randomUUID()

        let username = ''
        const session = await prisma.session.create({
            data: {
                userId,
                expires,
                sessionToken,
            }
        })
        const cookieStore = await cookies()
        Object.keys(user).filter(name => !name.toLowerCase().includes('password') && user[name] && typeof user[name] === 'string').forEach(name => {
            const value = user[name] as string
            const cookie = {
                name,
                value,
                expires: new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000),
                path: '/',
            }
            if (cookie.name === 'email' && !username) {
                username = value.split('@')[0]
                if (value.split('@').length === 1) username = value.split('%40')[0]
                if (username) username = username[0].toUpperCase() + username.slice(1)
            }
            cookieStore.set(cookie)
        })
        Object.entries(session)
            .filter(([_, value]) =>
                typeof value === 'string' && _ !== 'userId'
            )
            .forEach(([name, v]) => {
                const value = v as string
                const cookie = {
                    name: name === 'id' ? 'sessionId' : name,
                    value,
                    expires: session.expires,
                    path: '/',
                }
                cookieStore.set(cookie)
            })
        if (username) {
            cookieStore.set({
                name: 'name',
                value: username,
                expires: session.expires,
                path: '/',
            })
        }
        return Response.json({
            ...session,
            userId: undefined,
            user: {
                id: userId,
                email: user.email,
                name,
                image,
                updatedAt,
            },
        })
    }
    return Response.json({
        success,
        email: user?.email,
        hashed_password: user?.hashed_password,
    })

}