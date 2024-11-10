export function isBrowserImageFile(file: File) {
    if (!file || !file.type) return false;

    const supportedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/svg+xml",
        "image/avif",
    ];

    return supportedImageTypes.includes(file.type);
}
