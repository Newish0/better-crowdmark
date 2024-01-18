import { BCModule, ParsedFile } from "@/types/bc-module";

import markdownit from "markdown-it";
import hljs from "highlight.js";
import mermaid from "mermaid";

import markdownItTextualUml from "markdown-it-textual-uml";
import mk, { renderBatch as renderMKbatch } from "@/lib/markdown-it-katex";

import hljsCss from "highlight.js/styles/github.min.css?raw";
// import ghMdCss from "github-markdown-css/github-markdown-light.css?raw";

import { dataURLToBlob, removeExtension } from "@/content-scripts/bc-modules/utils";
import { imageFromHtml } from "@/lib/offscreen";

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

    await renderMKbatch(container);

    document.body.appendChild(container); // Mermaid requires element in DOM
    await mermaid.run({ nodes: container.querySelectorAll(".mermaid") });
    document.body.removeChild(container);

    const dataUrl = await imageFromHtml(container.outerHTML, {
        cssStyles: [
            hljsCss,
            "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-light.min.css",
            "https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css",
        ],
    });
    if (!dataUrl) throw new Error("Failed to convert html to image. Got null");
    return dataURLToBlob(dataUrl);
};

const markdownModule: BCModule = () => {
    return {
        name: "Markdown",
        slug: "markdown",
        extensions: [".md"],
        description:
            "Adds markdown file support with markdown math (Katex), mermaid, and more. Implemented using a fork of VSCode's parser, so the results should be quite similar!",
        authors: [
            {
                name: "Newish0",
                github: "github.com/Newish0",
            },
        ],
        async parse(markdownFile: File) {
            const mdImgBlob = await markdownToImg(await markdownFile.text());
            return new File([mdImgBlob], `${removeExtension(markdownFile.name)}.png`) as ParsedFile;
        },
    };
};

export default markdownModule;
