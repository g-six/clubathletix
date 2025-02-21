import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'

export async function getTeamPlayerProfile(team_player_id: string): Promise<PlayerTeamInfo | null> {
    const cookieList = await cookies()
    const session_id = cookieList.get('session_id')?.value
    if (!session_id) return null
    const session = await prisma.session.findUnique({
        where: {
            session_id
        },
        include: {
            user: true
        }
    })

    if (!session) return null

    const teamPlayer: PlayerTeamInfo = await prisma.teamPlayer.findUnique({
        where: {
            team_player_id,
        },
        include: {
            team: true,
            player: {
                include: {
                    parents: {
                        include: {
                            user: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    }
                }
            },
        }
    })

    return teamPlayer as PlayerTeamInfo
}

export type Team = Prisma.Args<typeof prisma.team, 'findUnique'>['data']
export type TeamPlayer = Prisma.Args<typeof prisma.teamPlayer, 'findUnique'>['data']
export type Player = Prisma.Args<typeof prisma.player, 'findUnique'>['data']
export type Parent = Prisma.Args<typeof prisma.playerParent, 'findUnique'>['data']
export type ParentUser = Parent & { user: { first_name: string; last_name: string; email: string; phone: string } }
export interface PlayerTeamInfo extends TeamPlayer {
    player: Player
    team: Team
    parents: ParentUser[]
}