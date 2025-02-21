import { prisma } from '@/prisma'
import { cookies } from 'next/headers'

export async function list(organization_id: string) {

    const data = await prisma.organization.findUnique({
        where: {
            organization_id
        },
        include: {
            Team: {
                include: {
                    members: true,
                    players: {
                        include: {
                            player: true
                        }
                    }
                }
            },
            Player: true,
        }
    })

    return data
}