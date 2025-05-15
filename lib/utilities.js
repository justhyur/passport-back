export async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replaceAll(" ", "-")
}
