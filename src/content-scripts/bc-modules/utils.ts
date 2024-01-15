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
export const injectStyle = (css: string, doc: Document = document, target?: Element) => {
    let eln: HTMLElement;

    if (validURL(css)) {
        const linkEln = doc.createElement("link");
        linkEln.rel = "stylesheet";
        linkEln.setAttribute("crossorigin", "anonymous");
        linkEln.href = css;
        eln = linkEln;
    } else {
        const styleEln = doc.createElement("style");
        styleEln.appendChild(doc.createTextNode(css));
        eln = styleEln;
    }

    const destination = target || doc.head || doc.getElementsByTagName("head")[0];
    destination.appendChild(eln);

    // Revert function
    return () => {
        destination.removeChild(eln);
    };
};

type ImageFromHTMLMiddleware = (doc?: Document) => void;

type ImageFromHTMLOptions = {
    cssStyles?: string[];
    before?: ImageFromHTMLMiddleware[];
    after?: ImageFromHTMLMiddleware[];
    width?: string;
    margin?: string;
};

/**
 *
 * @param html
 * @param cssStyles
 * @returns PNG data URL
 */
export const imageFromHTML = (
    html: string | HTMLElement,
    {
        cssStyles = [],
        before = [],
        after = [],
        width = "8.5in",
        margin = "0.5in",
    }: ImageFromHTMLOptions = {}
) => {
    /**
     * Converts HTML image in an isolated context/document
     * @param htmlStr
     * @returns
     */
    const htmlStrToImg = async (htmlStr: string) => {
        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe);
        iframe.contentWindow?.document.open();
        iframe.contentWindow?.document.write(htmlStr);
        iframe.contentWindow?.document.close();

        Object.assign(iframe.style, {
            width,
            margin: 0,
            padding: 0,
            border: 0,
            fontSize: `100%`,
            font: `inherit`,
            verticalAlign: `baseline`,
        });

        cssStyles.map((style) => injectStyle(style, iframe.contentWindow?.document));

        const body = iframe.contentDocument?.body;
        if (!body) return null;

        return new Promise<string>((r) => {
            iframe.contentWindow?.addEventListener("load", async () => {
                before.forEach((beforeMW) => beforeMW(iframe.contentWindow?.document));

                body.style.padding = margin;
                iframe.style.height = body.getBoundingClientRect().height + "px"; // Ensure full height is visible
                body.style.backgroundColor = "#fff";

                const dataUrl = await htmlToImage.toPng(body, {
                    pixelRatio: 2,
                    backgroundColor: "#fff",
                });
                after.forEach((afterMW) => afterMW(iframe.contentWindow?.document));
                r(dataUrl);
            });
        });
    };

    if (typeof html === "string") {
        return htmlStrToImg(html);
    } else {
        return htmlStrToImg(html.outerHTML);
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
