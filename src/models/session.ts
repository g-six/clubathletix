import { prisma } from '@/prisma'
import { Prisma, User, Session } from '@prisma/client'
import { cookies } from 'next/headers'
import { getOrganizationsByUserId } from './organization'
import { redirect } from 'next/navigation'

const hoursBeforeExpiry = 24 * 14
type SessionWithUser = Session & {
    user?: User
}
export async function createSession(user_id: string, initialise?: boolean): Promise<SessionWithUser | undefined> {
    const cookieStore = await cookies()
    let session_id = cookieStore.get('session_id')?.value || ''
    let session_token = crypto.randomUUID()
    let session: SessionWithUser | undefined = undefined
    let user: User | undefined = undefined
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
                        role: true,
                    }
                }
            }
        }) as unknown as SessionWithUser

        if (session) {
            user = session.user
        }
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

    const newSession = await prisma.session.create({
        data: {
            user_id,
            expires,
            session_token,
        }
    })

    session = newSession as unknown as SessionWithUser

    user && saveUserSession(user)
    saveSession(session)
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
    return {
        ...session,
        user,
    }
}

export async function saveUserSession(user: User, expires: Date = new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000)) {
    const cookieStore = await cookies()
    Object.entries(user)
        .filter(([_, value]) =>
            typeof value === 'string' && !_.startsWith('hashed')
        )
        .forEach(([name, v]) => {
            const value = v as string

            const cookie = {
                name,
                value,
                expires,
                path: '/',
            }
            cookieStore.set(cookie)
        })
}
export async function saveSession(session: Session, expires: Date = new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000)) {
    const cookieStore = await cookies()
    Object.entries(session)
        .filter(([_, value]) =>
            typeof value === 'string' && _ !== 'user_id'
        )
        .forEach(([name, v]) => {
            const value = v as string

            const cookie = {
                name: name === 'session_id' ? 'session_id' : name,
                value,
                expires,
                path: '/',
            }
            cookieStore.set(cookie)
        })
}
export type CreateSession = Prisma.Args<typeof prisma.session, 'create'>['data']