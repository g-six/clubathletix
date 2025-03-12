import { getAuthForOperation } from '@/models/auth'

export async function GET() {
    const me = await getAuthForOperation()
    return Response.json(me)
}