export function endPointBuild(
    baseHref: string,
    slug: string,
    isBuildAsShare: boolean = false
) {
    const baseUrl = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
    const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;

    if (isBuildAsShare) {
        return `${process.env.NEXTAUTH_URL}/${baseUrl}/${cleanSlug}`;
    }

    return `${baseUrl}/${cleanSlug}`;
}
