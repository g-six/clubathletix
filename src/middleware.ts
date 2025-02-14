import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const privatePaths = ['/dashboard']
const publicPaths = [
    '/login',
    '/register'
]
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Get the token from the cookies
    const token = request.cookies.get('sessionToken')?.value || ''

    // If trying to access a public path while logged in, redirect to dashboard
    if (publicPaths.includes(path) && token) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
    } else if (privatePaths.includes(path) && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
}
