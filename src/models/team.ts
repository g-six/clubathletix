import { prisma } from '@/prisma'
import { Prisma, Team as TeamType } from '@prisma/client'
import { getAuthForOperation } from './auth'
import { getPresignedUrlWithClient } from './file'

export async function getTeam(team_id: string) {
    const params = {
        where: {
            team_id
        },
        include: {
            league: {
                select: {
                    name: true,
                    start_date: true,
                    end_date: true,
                }
            },
            players: {
                select: {
                    name: true,
                    start_date: true,
                    end_date: true,
                },
                include: {
                    player: true
                }
            }
        }
    } as Prisma.TeamFindUniqueArgs
    const data = await prisma.team.findUnique(params)

    if (data) {
        const {
            organization_id,
            name,
            age_group,
            division,
            league_id,
            players,
            ...rest
        } = data as Team

        const { league } = rest as unknown as {
            league: Prisma.LeagueUncheckedCreateInput
        }

        return {
            league_id,
            league,
            organization_id,
            name,
            age_group,
            division,
            players
        }
    }
}

export async function createTeam(payload: Prisma.TeamUncheckedCreateInput): Promise<Prisma.TeamUncheckedCreateInput | undefined> {
    const data = await prisma.team.create({
        data: payload
    })

    if (data) {
        const {
            organization_id,
            name,
            age_group,
            division,
            league_id,
            created_by,
            team_id
        } = data

        await prisma.teamMember.create({
            data: {
                organization_id,
                team_id,
                user_id: created_by,
                role: 'owner',
                created_by,
            }
        })

        return {
            league_id,
            organization_id,
            name,
            age_group,
            division
        } as Prisma.TeamUncheckedCreateInput
    }
}

export async function updateTeam(formData: FormData): Promise<TeamType | undefined> {
    let payload: {
        [k: string]: string
    } = {}
    formData.forEach(function (value, key) {
        if ([
            'name',
            'short_name',
            'division',
            'age_group',
            'team_id',
            'logo'
        ].includes(key)) payload[key] = value as string
    })
    console.log(payload)
    const session = await getAuthForOperation()
    if (session?.user_id) {
        const { team_id, logo: sourceLogo, ...updates } = payload

        if (sourceLogo) {
            try {
                const imageType = sourceLogo.split(';')[0].replace('data:', '')
                const buf = Buffer.from(sourceLogo.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                const Key = `teams/${team_id}/logo.${imageType.split('/')[1].toLowerCase()}`

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
                    updates.logo = Key
                }

            } catch (error) {
                console.log('Error in logo')
            }
        }
        return await prisma.team.update({
            where: {
                team_id
            },
            data: {
                ...updates,
                updated_by: session?.user_id
            }
        })
    }
}

type Player = Prisma.Args<typeof prisma.player, 'create'>['data']
type TeamPlayer = Prisma.Args<typeof prisma.player, 'create'>['data']
type Team = Prisma.Args<typeof prisma.team, 'create'>['data'] & {
    players?: (TeamPlayer & { player: Player })[]
}