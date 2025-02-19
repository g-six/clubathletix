export async function GET(request: Request) {
    return Response.json({
        success: false,
        ...request,
    })
}