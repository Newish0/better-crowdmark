/**
 * utils.ts
 *
 * This is a utility file that allow bc-modules can use.
 */

import * as htmlToImage from "html-to-image";

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

/**
 *
 * @param css
 * @param doc
 * @param target
 * @returns function to revert the operation (aka clean up function)
 */
export const injectStyle = async (css: string, doc: Document, target?: Element) => {
    let eln: HTMLElement;

    const promise = new Promise<void>((resolve) => {
        const onStylesheetLoad = () => {
            resolve();
        };

        if (validURL(css)) {
            const linkEln = doc.createElement("link");
            linkEln.rel = "stylesheet";
            linkEln.setAttribute("crossorigin", "anonymous");
            linkEln.href = css;
            linkEln.onload = onStylesheetLoad;
            eln = linkEln;
        } else {
            const styleEln = doc.createElement("style");
            styleEln.appendChild(doc.createTextNode(css));
            eln = styleEln;
            // Resolve immediately for inline styles
            resolve();
        }

        const destination = target || doc.head || doc.getElementsByTagName("head")[0];
        destination.appendChild(eln);
    });

    // Revert function
    const revert = () => {
        const destination = target || doc.head || doc.getElementsByTagName("head")[0];
        destination.removeChild(eln);
    };

    return promise.then(() => revert);
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
