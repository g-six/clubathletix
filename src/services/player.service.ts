export async function createPlayer(payload: { [k: string]: unknown }) {
    const res = await fetch('/api/players', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    const json = await res.json()
    return json
}

export async function findPlayers(payload: { [k: string]: unknown }) {
    const res = await fetch(`/api/players${objectToSearchParams(payload)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const json = await res.json()
    return json
}

export function objectToSearchParams(params: { [k: string]: unknown }): string {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value as string)
    }
    return `?${searchParams.toString()}`
}
