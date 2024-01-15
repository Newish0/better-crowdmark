import * as htmlToImage from "html-to-image";

import markdownit from "markdown-it";
import hljs from "highlight.js";
import mermaid from "mermaid";

import markdownItTextualUml from "markdown-it-textual-uml";
import mk, { renderBatch as renderMKbatch } from "@/lib/markdow-it-katex";

import hljsCss from "highlight.js/styles/github.min.css?raw";
import ghMdCss from "github-markdown-css/github-markdown-light.css?raw";
import katexCss from "katex/dist/katex.min.css?raw";

mermaid.initialize({ startOnLoad: false });

/**
 *
 * @param css
 * @param doc
 * @param target
 * @returns function to revert the operation (aka clean up function)
 */
export const injectStyle = (css: string, doc: Document = document, target?: Element) => {
    const styleElement = doc.createElement("style");
    styleElement.appendChild(doc.createTextNode(css));
    const destination = target || doc.head || doc.getElementsByTagName("head")[0];
    destination.appendChild(styleElement);

    // Revert function
    return () => {
        destination.removeChild(styleElement);
    };
};

/**
 *
 * @param html
 * @param cssStyles
 * @returns PNG data URL
 */
export const imageFromHTML = (
    html: string | HTMLElement,
    { cssStyles = [] }: { cssStyles?: string[] } = {}
) => {
    /**
     * Converts HTML image in an isolated context/document
     * @param htmlStr
     * @returns
     */
    const htmlStrToImg = async (htmlStr: string) => {
        const container = document.createElement("div");
        container.innerHTML = htmlStr;

        Object.assign(container.style, {
            width: "8.5in",
        });

        document.body.appendChild(container);

        const styleCleanupFuncs = cssStyles.map((style) => injectStyle(style));
        await mermaid.run({ nodes: container.querySelectorAll(".mermaid") });
        await renderMKbatch();
        await new Promise<void>((r) => setTimeout(r, 1000));
        const dataUrl = await htmlToImage.toPng(container);

        // TODO: add back cleanup
        // styleCleanupFuncs.forEach((func) => func());
        return dataUrl;
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

    const dataUrl = await imageFromHTML(container, {
        cssStyles: [hljsCss, ghMdCss, katexCss],
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
