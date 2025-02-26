import { createLeague, getLeague } from '@/models/league'
import { createSession } from '@/models/session'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const user_id = cookieStore.get('user_id')?.value

    if (user_id) {
        const session = await createSession(user_id)
        const payload = await request.json()
        let { organization_id, ...rest } = payload

        if (session) {
            if (!organization_id) organization_id = cookieStore.get('organization_id')?.value
            const data = {
                ...rest,
                organization_id,
                created_by: session.user_id
            }
            try {
                const league = await createLeague(data)
                return Response.json(league, {
                    status: 201
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