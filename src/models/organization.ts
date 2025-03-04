import { getPresignedUrlWithClient } from '@/models/file'
import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'
import { getAuthForOperation } from './auth'
import { SessionOrganization } from '@/typings/organization'
import { SessionTeam } from '@/typings/team'
import { SessionMatch } from '@/typings/match'
import { SessionPlayer } from '@/typings/player'
import { SessionUser } from '@/typings/user'
import { SesssionLeague } from '@/typings/league'

export async function getOrganizationsByUserId(user_id: string) {

    const userOrganizations: {
        organization_id: string
        role: string
        organization: unknown
    }[] = await prisma.userOrganization.findMany({
        where: {
            user_id
        },
        include: {
            organization: true
        }
    })

    const logos: Promise<string>[] = []

    const results = userOrganizations.map(uo => {
        const organization = uo.organization as unknown as Prisma.OrganizationCreateInput
        logos.push(organization.logo ? getPresignedUrlWithClient(organization.logo, 'GET') : Promise.resolve(''))

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

export async function getMySessionAndOrganization(organization_id: string, options?: {
    players?: {
        take: number
        skip?: number
    },
    teams?: {
        take: number
        skip?: number
    }
}) {
    const [organization, teams, members, matches, leagues, players, session] = await Promise.all([
        prisma.organization.findUnique({
            where: {
                organization_id
            }
        }),
        prisma.team.findMany({
            include: {
                league: true
            },
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
                        phone: true,
                        image: true,
                        created_at: true,
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
        }) : Promise.resolve([]),
        getAuthForOperation()
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
        session
    } as SessionOrganization & {
        teams: SessionTeam[]
        members: {
            team_member_id: string
            user_id: string
            team_id: string
            role: string
            user: Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'image'>
        }[]
        leagues: SesssionLeague[]
        matches: SessionMatch[]
        players: SessionPlayer[]
        session: SessionUser
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

export async function updateOrganization(organization_id: string, payload: Prisma.OrganizationUpdateInput) {
    let { logo: sourceLogo, domain, ...input } = payload
    const data = Prisma.validator<Prisma.OrganizationUpdateInput>()({
        domain: domain || undefined,
        logo: undefined as unknown as string,
        ...input
    })

    if (sourceLogo) {
        try {
            const imageType = `${sourceLogo}`.split(';')[0].replace('data:', '')
            const buf = Buffer.from(`${sourceLogo}`.replace(/^data:image\/\w+;base64,/, ""), 'base64')
            const Key = `${input.short_name}/${organization_id}/logo.${imageType.split('/')[1]}`.toLowerCase()

            const putObjCommandUrl = await getPresignedUrlWithClient(Key, 'PUT')

            const uploaded = await fetch(putObjCommandUrl, {
                method: 'PUT',
                body: buf,
                headers: {
                    'Content-Encoding': 'base64',
                    'Content-Type': imageType
                }
            })

            if (uploaded.ok) {
                data.logo = Key
            }

        } catch (error) {
            console.log('Error in logo')
        }
    }
    const organization = await prisma.organization.update({
        where: {
            organization_id
        },
        data
    })

    return organization
}

export type CreateOrganization = Prisma.Args<typeof prisma.organization, 'create'>['data']
export type Organization = Prisma.Args<typeof prisma.organization, 'findUnique'>['data']
export type Team = Prisma.Args<typeof prisma.team, 'findUnique'>['data']
export type TeamMember = Prisma.Args<typeof prisma.teamMember, 'findUnique'>['data']
export type User = Prisma.Args<typeof prisma.user, 'findUnique'>['data']
export type Player = Prisma.Args<typeof prisma.player, 'findUnique'>['data']