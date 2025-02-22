export async function signOut() {
    await fetch('/api/logout', {
        method: 'DELETE',
    })
}