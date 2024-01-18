/**
 * utils.ts
 *
 * This is a utility file that allow bc-modules can use.
 */

/**
 * Checks if string is a URL
 *
 * @param str
 * @returns
 */
export const validURL = (str: string) => {
    try {
        return new URL(str) && true;
    } catch (e) {
        return false;
    }
};

export const removeExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "");
};

export const getExtension = (filename: string) => {
    return filename.slice(filename.lastIndexOf(".")).toLowerCase();
};

export const dataURLToBlob = async (dataURL: string) => {
    return await (await fetch(dataURL)).blob();
};
