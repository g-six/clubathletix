import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

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
    console.log(payload)
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

type Player = Prisma.Args<typeof prisma.player, 'create'>['data']
type TeamPlayer = Prisma.Args<typeof prisma.player, 'create'>['data']
type Team = Prisma.Args<typeof prisma.team, 'create'>['data'] & {
    players?: (TeamPlayer & { player: Player })[]
}