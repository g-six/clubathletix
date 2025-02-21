import { prisma } from '@/prisma'
import { CreateTraining } from '@/services/training.service'

export async function createTraining(payload: unknown) {
    const {
        team_id,
        organization_id,
        league_id,
        session_start,
        session_end,
        location,
        timezone,
        created_by,
    } = payload as CreateTraining

    try {
        return await prisma.training.create({
            data: {
                team_id,
                organization_id,
                league_id,
                location,
                session_start,
                session_end,
                timezone,
                created_by,
            }
        })
    } catch (error) {
        console.log('error')
    }
}