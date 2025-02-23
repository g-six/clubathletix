import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const privatePaths = [
    '/dashboard',
    '/member',
    '/organization',
    '/standing',
    '/tournament',
    '/event',
    '/settings',
    '/?',
]
const publicPaths = [
    '/api',
    '/invitations',
    '/login',
    '/logout',
    '/register',
]
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    // Get the token from the cookies
    const token = request.cookies.get('session_token')?.value || ''
    const session = request.cookies.get('session_id')?.value || ''
    // If trying to access a public path while logged in, redirect to dashboard

    if (path.startsWith('/logout')) {
        const cookieList = await cookies()
        for (const pair of cookieList.getAll()) {
            cookieList.set(pair.name, '', { maxAge: 0 })
        }
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    } else if (publicPaths.includes(path) && session) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
    } else if (Boolean(privatePaths.find(p => path.startsWith(p)) || path === '/')) {
        if (!token && !path.includes('/matches/') && !path.includes('/organizations/') && !path.includes('/teams/'))
            return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    return NextResponse.next()
}
