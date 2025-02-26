import { getPresignedUrlWithClient } from '@/models/file'
import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'

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
        organization: unknown
    }[] = await prisma.userOrganization.findMany({
        where: {
            user_id: session?.user?.user_id
        },
        include: {
            organization: true
        }
    })

    const logos: Promise<string>[] = []

    const results = userOrganizations.map(uo => {
        const organization = uo.organization as unknown as Prisma.OrganizationCreateInput
        logos.push(organization.logo ? getPresignedUrlWithClient(organization.logo) : Promise.resolve(''))

        return {
            organization_id: uo.organization_id,
            name: organization.name,
            role: uo.role,
            organization: {
                name: organization.name,
                logo: organization.logo
            }
        }
    })

    return (await Promise.all(logos)).map((logo, idx) => ({
        ...results[idx],
        organization: {
            ...results[idx].organization,
            logo
        }
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
    const [organization, teams, members, matches, leagues, players] = await Promise.all([
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
        }),
        prisma.league.findMany({
            where: {
                organization_id
            },
            orderBy: [{
                created_at: 'desc'
            }]
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
        members: members.map(m => ({
            team_member_id: m.team_member_id,
            user_id: m.user_id,
            team_id: m.team_id,
            role: m.role,
            user: m.user,
        })),
        matches,
        players,
        leagues,
    }
}

export async function createOrganization(payload: Prisma.OrganizationCreateInput) {
    let { domain, ...input } = payload
    const data = Prisma.validator<Prisma.OrganizationCreateInput>()({
        domain: domain || undefined,
        ...input
    })

    const organization = await prisma.organization.create({
        data
    })
    if (organization.organization_id) {
        const cookieList = await cookies()
        cookieList.set('organization_id', organization.organization_id)

        await prisma.userOrganization.create({
            data: {
                user_id: data.created_by,
                role: 'owner',
                organization_id: organization.organization_id,
                created_by: data.created_by,
            }
        })
    }
    return organization
}

export type CreateOrganization = Prisma.Args<typeof prisma.organization, 'create'>['data']
export type Organization = Prisma.Args<typeof prisma.organization, 'findUnique'>['data']
export type Team = Prisma.Args<typeof prisma.team, 'findUnique'>['data']
export type TeamMember = Prisma.Args<typeof prisma.teamMember, 'findUnique'>['data']
export type User = Prisma.Args<typeof prisma.user, 'findUnique'>['data']
export type Player = Prisma.Args<typeof prisma.player, 'findUnique'>['data']