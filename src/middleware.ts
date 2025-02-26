import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOrganization } from './models/organization'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    // Get the token from the cookies
    const token = request.cookies.get('session_token')?.value || ''
    const session = request.cookies.get('session_id')?.value || ''
    // If trying to access a public path while logged in, redirect to dashboard

    if (!token && !session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}
export const config = {
    matcher: [
        // Apply middleware to specific routes
        '/dashboard',
        '/organizations/:path*',
        '/members/:path*',
    ]
}

