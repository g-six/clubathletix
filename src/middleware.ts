import { auth } from "@/auth"
import { NextResponse } from 'next/server'

const publicPaths = [
    '/match-control/',
    '/_',
    '/login',
    '/settings',
    '/api',
    '/invitations/accept',
]
export default auth((req) => {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-url', req.url)

    if (!req.auth && !isIgnoredPath(req.nextUrl.pathname)) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
    return NextResponse.next({
        request: {
            // Apply new request headers
            headers: requestHeaders,
        }
    })
})

function isIgnoredPath(path: string): boolean {
    return Boolean(publicPaths.find(p => path.startsWith(p))) || /\.(png|jpg|jpeg|gif|svg|ico)$/.test(path)
}

