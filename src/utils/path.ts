export const removeExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "");
};

export const getExtension = (filename: string, includeDot = false) => {
    let ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();

    if (!includeDot) {
        ext = ext.slice(1);
    }

    return ext;
};
