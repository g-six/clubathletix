import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'
import { getOrganizationsByUserId } from './organization'

const hoursBeforeExpiry = 0.5

export async function createSession(user_id: string, initialise?: boolean): Promise<CreateSession> {
    const cookieStore = await cookies()
    let session_id = cookieStore.get('session_id')?.value || ''
    let session_token = crypto.randomUUID()
    let session: CreateSession = undefined
    if (session_id) {
        session = await prisma.session.findFirst({
            where: {
                session_id,
                user_id,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true,
                        timezone: true,
                    }
                }
            }
        })
    }

    await prisma.session.deleteMany({
        where: {
            user_id
        }
    })

    if (!session && !initialise) {
        cookieStore.delete('session_id')
        cookieStore.delete('session_token')
        cookieStore.delete('user_id')
        return
    }

    const expires = new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000)

    session = await prisma.session.create({
        data: {
            user_id,
            expires,
            session_token,
        }
    })

    const user = await prisma.user.findUnique({
        where: {
            user_id
        }
    })

    Object.entries(user)
        .filter(([_, value]) =>
            typeof value === 'string' && !_.startsWith('hashed')
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
    Object.entries(session)
        .filter(([_, value]) =>
            typeof value === 'string' && _ !== 'user_id'
        )
        .forEach(([name, v]) => {
            const value = v as string
            if (name === 'session_id') {
                session_id = value

            }
            const cookie = {
                name: name === 'session_id' ? 'session_id' : name,
                value,
                expires: session.expires,
                path: '/',
            }
            cookieStore.set(cookie)
        })

    if (!cookieStore.has('organization_id') && session_id) {
        const organizations = await getOrganizationsByUserId(session_id)
        if (organizations.length > 1) {
            const cookie = {
                name: 'organization_id',
                value: organizations[0].organization_id,
                path: '/',
            }
            cookieStore.set(cookie)
        }
    }
    return session
}

export type CreateSession = Prisma.Args<typeof prisma.Session, 'create'>['data']