import { getLeague, updateLeague } from '@/models/league'
import { createSession } from '@/models/session'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ league_id: string }> }) {
    const cookieStore = await cookies()
    const user_id = cookieStore.get('user_id')?.value
    const { league_id } = await params

    if (user_id) {
        const session = await createSession(user_id)
        const payload = await request.json()
        let { organization_id, ...rest } = payload

        if (session) {
            if (!organization_id) organization_id = cookieStore.get('organization_id')?.value
            const data = {
                ...rest,
                organization_id,
                updated_by: session.user_id
            }
            try {
                const league = await updateLeague(league_id, data)
                return Response.json(league, {
                    status: 200
                })
            } catch (error) {

                return Response.json({
                    success: false,
                    error: 'Unable to create league',
                    data
                })
            }
        }
    }

    return Response.json({
        error: 'Unauthorized',
    })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ league_id: string }> }) {
    const cookieStore = await cookies()
    const user_id = cookieStore.get('user_id')?.value
    const { league_id } = await params

    if (user_id) {
        const session = await createSession(user_id)
        const payload = await request.json()
        let { organization_id, ...rest } = payload

        if (session) {
            if (!organization_id) organization_id = cookieStore.get('organization_id')?.value
            const data = {
                ...rest,
                organization_id,
                updated_by: session.user_id
            }
            try {
                const league = await getLeague(league_id)
                return Response.json(league, {
                    status: 200
                })
            } catch (error) {

                return Response.json({
                    success: false,
                    error: 'Unable to create league',
                    data
                })
            }
        }
    }

    return Response.json({
        error: 'Unauthorized',
    })
}