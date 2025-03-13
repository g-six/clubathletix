export function formatDateTime(date: Date, locale = 'en-CA', date_first?: boolean): string {
    let t = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
    let d = date.toLocaleDateString(locale, { month: 'short', weekday: 'short', day: 'numeric' })

    return date_first ? `${d}, ${t}` : `${t}, ${d}`
}

export function formatYmdHm(date: Date, locale = 'en-CA'): string {
    let t = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })
    let d = date.toLocaleDateString(locale, { month: '2-digit', day: '2-digit', year: 'numeric' })

    return `${d} ${t}`
}

export function formatTime(ts: string, locale = 'en-CA'): string {
    let t = new Date(ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })

    return t
}

export function getLengthInMinutes(from: string, to: string, locale = 'en-CA'): string {
    let f = new Date(from).getTime()
    let t = new Date(to).getTime()
    let diff = t - f

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.round(((diff / 60000) - minutes) * 60)

    return `${minutes}'${seconds}"`
}