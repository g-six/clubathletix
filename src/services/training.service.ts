import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'

export async function createTraining(payload: unknown) {
    const {
        team_id,
        organization_id,
        league_id,
        location,
        session_start,
        session_end,
        timezone,
    } = payload as CreateTraining

    try {
        await fetch('/api/trainings', {
            method: 'POST',
            body: JSON.stringify({
                team_id,
                organization_id,
                league_id,
                location,
                session_start,
                session_end,
                timezone
            })
        })
    } catch (error) {
        console.log('error')
    }
}

export type CreateTraining = Prisma.Args<typeof prisma.Training, 'create'>['data']