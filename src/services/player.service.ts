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