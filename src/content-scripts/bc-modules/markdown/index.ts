import { BCModule, ParsedFile } from "@/types/bc-module";

import markdownit from "markdown-it";
import hljs from "highlight.js";
import mermaid from "mermaid";

import markdownItTextualUml from "markdown-it-textual-uml";
import mk, { renderBatch as renderMKbatch } from "@/lib/markdown-it-katex";

import hljsCss from "highlight.js/styles/github.min.css?raw";
import ghMdCss from "github-markdown-css/github-markdown-light.css?raw";

import { dataURLToBlob, imageFromHTML, removeExtension } from "@/content-scripts/bc-modules/utils";

mermaid.initialize({ startOnLoad: false });

/**
 * Converts markdown string to png blob
 * @param mdStr
 * @returns PNG data blob
 */
const markdownToImg = async (mdStr: string) => {
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
    return dataURLToBlob(dataUrl);
};

const markdownModule: BCModule = () => {
    return {
        name: "Markdown",
        extensions: [".md"],
        async parse(markdownFile: File) {
            const mdImgBlob = await markdownToImg(await markdownFile.text());
            return new File([mdImgBlob], `${removeExtension(markdownFile.name)}.png`) as ParsedFile;
        },
    };
};

export default markdownModule;