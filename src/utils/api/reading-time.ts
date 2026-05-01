export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed

    // Remove HTML tags and extra whitespace
    const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const wordCount = cleanContent.trim().split(/\s+/).length;

    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime); // Minimum 1 minute
}

export function calculateReadingTimeAdvanced(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/);
    const wordCount = words.length;

    // Count images (affects reading time)
    const imageCount = (content.match(/<img[^>]*>/g) || []).length;

    // Base reading time
    let readingTime = wordCount / wordsPerMinute;

    // Add time for images (12 seconds for first image, 11 for second, etc.)
    if (imageCount > 0) {
        let imageTime = 0;
        for (let i = 1; i <= imageCount; i++) {
            imageTime += Math.max(12 - (i - 1), 3); // Min 3 seconds per image
        }
        readingTime += imageTime / 60; // Convert to minutes
    }

    return Math.max(1, Math.ceil(readingTime));
}
