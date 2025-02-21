import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

export async function getOrganizationsByUserId(session_id: string) {
    if (!session_id) return []
    const session = await prisma.session.findUnique({
        where: {
            session_id
        },
        include: {
            user: true
        }
    })

    const userOrganizations: {
        organization_id: string
        role: string
        organization: {
            name: string
        }
    }[] = await prisma.userOrganization.findMany({
        where: {
            user_id: session?.user?.user_id
        },
        include: {
            organization: true
        }
    })

    return userOrganizations.map(uo => ({
        organization_id: uo.organization_id,
        name: uo.organization.name,
        role: uo.role,
    }))
}

export async function getOrganization(organization_id: string, options?: {
    players?: {
        take: number
        skip?: number
    },
    teams?: {
        take: number
        skip?: number
    }
}) {
    const [organization, teams, members, matches, players] = await Promise.all([
        prisma.organization.findUnique({
            where: {
                organization_id
            }
        }),
        prisma.team.findMany({
            where: {
                organization_id
            }
        }),
        prisma.teamMember.findMany({
            where: {
                organization_id
            },
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
        }),
        prisma.match.findMany({
            where: {
                organization_id
            },
            orderBy: [{
                match_date: 'desc'
            }, {
                organization_id: 'asc'
            }],
            include: {
                team: true,
            }
        }),
        options?.players ? prisma.teamPlayer.findMany({
            where: {
                organization_id
            },
            include: {
                player: true
            },
            take: options.players.take,
            skip: options.players.skip || 0,
        }) : Promise.resolve([])
    ])
    return {
        ...organization,
        teams,
        members: members.map((m: TeamMember & { user: User }) => ({
            team_member_id: m.team_member_id,
            user_id: m.user_id,
            team_id: m.team_id,
            role: m.role,
            user: m.user,
        })),
        matches,
        players
    }
}

export type Organization = Prisma.Args<typeof prisma.organization, 'findUnique'>['data']
export type Team = Prisma.Args<typeof prisma.team, 'findUnique'>['data']
export type TeamMember = Prisma.Args<typeof prisma.teamMember, 'findUnique'>['data']
export type User = Prisma.Args<typeof prisma.user, 'findUnique'>['data']
export type Player = Prisma.Args<typeof prisma.player, 'findUnique'>['data']