import { auth } from "@/auth"

export default auth((req) => {
    if (!req.auth && !isIgnoredPath(req.nextUrl.pathname)) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }

})

function isIgnoredPath(path: string): boolean {
    return path.startsWith("/match-control/") || path.startsWith("/_") || path.startsWith("/login") || path.startsWith("/api/") || /\.(png|jpg|jpeg|gif|svg|ico)$/.test(path)
}

