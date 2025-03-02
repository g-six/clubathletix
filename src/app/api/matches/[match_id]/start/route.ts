import { getAuthForOperation } from '@/models/auth'
import { getMatch, updateMatch } from '@/models/match'
import { createMatchEvent } from '@/models/match-event'
import { Match } from '@prisma/client'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ match_id: string }> }) {
    const match_id = (await params).match_id
    const { reason, localized_time } = await request.json()
    if (match_id) {
        let match = await getMatch(match_id)
        if (match?.team?.members.length) {
            const updated_by = match?.team?.members[0].user_id
            if (updated_by) {
                let part_to_update: {
                    fh_start?: string
                    sh_start?: string
                } = {
                }

                if (reason === 'start match' && !match.fh_end) part_to_update.fh_start = localized_time
                else if (reason === 'start 2nd half' && !match.sh_start && !match.sh_end) part_to_update.sh_start = localized_time
                else return Response.json({
                    message: 'Invalid reason to start match',
                    reason
                }, {
                    status: 400
                })


                await updateMatch({
                    ...part_to_update as unknown as Match,
                    match_id,
                    updated_by,
                } as Match)
                return Response.json({
                    ...match,
                    ...part_to_update as unknown as Match,
                })
            }
        }
        return Response.json({
            message: 'Unauthorized to log match events'
        }, {
            status: 401
        })
    }
    // const match = await createMatchEvent({
    //     match_id,
    //     event_type: 'goal',
    //     ...payload,
    // })
    return Response.json({
        message: 'Match failed to start due to invalid criteria'
    }, {
        status: 400
    })

}