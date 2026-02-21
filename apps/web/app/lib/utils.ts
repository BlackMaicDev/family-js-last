export const getFullUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}${url}`;
};
