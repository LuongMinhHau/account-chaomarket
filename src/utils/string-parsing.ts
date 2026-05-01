export function capitalizeWords(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function splitAndTrim(str: string, separator: string) {
    return str
        .split(separator)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

export function capitalizeFirstLetterOnly(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function addDotsLastSentence(str: string) {
    if (str.charAt(str.length - 1) === '.') {
        return str;
    }
    return str + '.';
}
