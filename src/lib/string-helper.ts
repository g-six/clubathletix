export function createSlug(sentence: string): string {
    return sentence
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}
