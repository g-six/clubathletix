import { Training } from '@prisma/client'

export async function createTraining(payload: unknown) {
    const {
        team_id,
        organization_id,
        league_id,
        location,
        session_start,
        session_end,
        timezone,
    } = payload as Training

    try {
        return await fetch('/api/trainings', {
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