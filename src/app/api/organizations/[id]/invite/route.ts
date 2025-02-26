import { inviteUser } from '@/models/user'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: organization_id } = await params
    const payload = await req.json()
    const user = await inviteUser({
        ...payload,
        organization_id
    })
    return Response.json({
        user, payload: {
            ...payload,
            organization_id
        }
    }, {
        status: 201
    })
}