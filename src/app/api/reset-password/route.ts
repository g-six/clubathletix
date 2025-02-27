import { resetPassword } from '@/models/user'

export async function POST(req: Request) {
    const payload = await req.json()
    const session = await resetPassword(payload.email)
    return Response.json(session, {
        status: 200
    })
}