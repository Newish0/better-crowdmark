/**
 * utils.ts
 *
 * This is a utility file that allow bc-modules can use.
 */

import { imageFromHtml as offScreenImageFromHtml } from "@/lib/offscreen";

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

// A reexport of a key lib function
//
// Note: Cannot use `export * from "some/path"` since vite generates `_commonjsHelper.js`
//       which violates the not `_` prefix rule for Chrome extensions.
export const imageFromHtml = offScreenImageFromHtml;
