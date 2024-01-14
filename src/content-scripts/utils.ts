import * as htmlToImage from "html-to-image";

import markdownit from "markdown-it";
import hljs from "highlight.js";

import hljsCss from "highlight.js/styles/github.min.css?raw";
import ghMdCss from "github-markdown-css/github-markdown-light.css?raw";

export const injectStyle = (doc: Document, css: string) => {
    const styleElement = doc.createElement("style");
    styleElement.appendChild(doc.createTextNode(css));
    const head = doc.head || doc.getElementsByTagName("head")[0];
    head.appendChild(styleElement);
};

export const imageFromHTML = (html: string | HTMLElement, cssStyles: string[] = []) => {
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
            position: "fixed",
            width: "8.5in",
            height: iframe.contentWindow?.document.documentElement.scrollHeight + "px",
            top: 0,
        });

        const body = iframe.contentWindow?.document.body;
        if (!body) return null;
        for (const style of cssStyles) injectStyle(iframe.contentWindow.document, style);
        const dataUrl = await htmlToImage.toPng(body);
        // document.body.removeChild(iframe); // cleanup
        return dataUrl;
    };

    if (typeof html === "string") {
        return htmlStrToImg(html);
    } else {
        return htmlStrToImg(html.outerHTML);
    }
};

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
    const container = document.createElement("div");
    container.classList.add("markdown-body");
    const htmlStr = md.render(mdStr);
    console.log("MADE IT!", htmlStr);
    container.innerHTML = htmlStr;

    const dataUrl = await imageFromHTML(container, [hljsCss, ghMdCss]);
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
