import * as htmlToImage from "html-to-image";

import markdownit from "markdown-it";
import hljs from "highlight.js";
import mermaid from "mermaid";

import markdownItTextualUml from "markdown-it-textual-uml";
import mk, { renderBatch as renderMKbatch } from "@/lib/markdown-it-katex";

import hljsCss from "highlight.js/styles/github.min.css?raw";
import ghMdCss from "github-markdown-css/github-markdown-light.css?raw";

mermaid.initialize({ startOnLoad: false });

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

                iframe.style.height = body.getBoundingClientRect().height + "px"; // Ensure full height is visible
                body.style.padding = margin;
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

/**
 *
 * @param mdStr
 * @returns PNG data blob
 */
export const markdownToImg = async (mdStr: string) => {
    const md = markdownit({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang }).value;
                } catch (__) {}
            }

            return ""; // use external default escaping
        },
    });

    md.use(markdownItTextualUml);
    md.use(mk);

    const container = document.createElement("div");

    container.classList.add("markdown-body");
    const htmlStr = md.render(mdStr);
    console.log("MADE IT!", htmlStr);
    container.innerHTML = htmlStr;

    document.body.appendChild(container);

    await mermaid.run({ nodes: container.querySelectorAll(".mermaid") });
    await renderMKbatch();

    const dataUrl = await imageFromHTML(container, {
        cssStyles: [
            hljsCss,
            ghMdCss,
            "https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css",
        ],
    });
    if (!dataUrl) throw new Error("Failed to convert html to image. Got null");
    console.log("DATA URL", dataUrl);
    return dataURLToBlob(dataUrl);
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
