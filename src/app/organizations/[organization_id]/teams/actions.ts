import { prisma } from '@/prisma'

export async function getTeam(team_id: string) {

    const data = await prisma.team.findUnique({
        where: {
            team_id
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true,
                            image: true,
                        }
                    }
                }
            },
            players: {
                include: {
                    player: true
                }
            },
        }
    })

    return data
}