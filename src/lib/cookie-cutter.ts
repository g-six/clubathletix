export function getCookies() {
    const allCookies = document.cookie.split(';').map((cookie) => cookie.trim())
    let cookies: {
        [k: string]: string
    } = {}
    allCookies.forEach(cookie => {
        cookies = {
            ...cookies,
            [cookie.split('=')[0]]: cookie.split('=')[1],
        }
    })

    if (!cookies.name && cookies.email) {
        cookies.name = cookies.email.split('@')[0]
        if (cookies.name) cookies.name = cookies.name[0].toUpperCase() + cookies.name.slice(1)
    }

    return cookies
}

export function clearCookies() {
    const cookies = getCookies()
    Object.keys(cookies).forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
}