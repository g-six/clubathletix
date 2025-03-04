import { getAuthForOperation } from '@/models/auth'
import { getMatch, updateMatch } from '@/models/match'
import { createMatchEvent } from '@/models/match-event'
import { Match } from '@prisma/client'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ match_id: string }> }) {
    const match_id = (await params).match_id
    const { localized_time, reason } = await request.json()
    if (match_id) {
        let match = await getMatch(match_id)
        if (match?.team?.members.length) {
            const updated_by = match?.team?.members[0].user_id

            if (updated_by) {
                if (!match.sh_end) {
                    let part_to_update: {
                        fh_start?: string
                        fh_end?: string
                        sh_start?: string
                        sh_end?: string
                        status: string
                    } = {
                        status: match.status
                    }

                    if (reason === 'end 1st half') {
                        part_to_update.fh_end = localized_time
                        part_to_update.status = 'halftime'
                    } else if (reason === 'end 2nd half' && match.fh_end) {
                        part_to_update.sh_end = localized_time
                        part_to_update.status = 'fulltime'
                    }
                    else if (reason.startsWith('end ') && match.fh_end) {
                        part_to_update.sh_end = localized_time
                        part_to_update.status = 'fulltime'
                    }

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
                return Response.json(match)
            }
        }
        return Response.json({
            message: 'Unauthorized to log match events'
        }, {
            status: 401
        })
    }
    return Response.json({
        message: 'Match failed to start due to invalid criteria'
    }, {
        status: 400
    })

}