export function formatDateTime(date: Date, locale = 'en-CA'): string {
    let t = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
    let d = date.toLocaleDateString(locale, { month: 'short', weekday: 'short', day: 'numeric' })

    return `${t}, ${d}`
}