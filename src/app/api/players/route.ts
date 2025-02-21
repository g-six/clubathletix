import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const session_id = cookieStore.get('session_id')?.value
  let session = await prisma.session.findUnique({
    where: {
      session_id
    },
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
          phone: true
        }
      }
    }
  })

  if (session?.user?.user_id) {
    const new_session = await createSession(session?.user.user_id)
    session = {
      ...session,
      ...new_session
    }
  }
  return Response.json({
    success: false,
    ...request,
  })
}