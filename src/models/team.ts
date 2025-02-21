import { prisma } from '@/prisma'

export async function getTeam(team_id: string) {
    const data = await prisma.team.findUnique({
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
            }
        }
    })

    const {
        league,
        organization_id,
        name,
        age_group,
        division,
        league_id,
    } = data

    return {
        league_id,
        league,
        organization_id,
        name,
        age_group,
        division
    }
}