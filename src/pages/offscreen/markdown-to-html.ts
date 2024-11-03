import hljs from "highlight.js";
import markdownit from "markdown-it";

import mk from "@vscode/markdown-it-katex";
// import mt from "markdown-it-textual-uml";

import oneDarkLightCSS from "highlight.js/styles/atom-one-light.min.css?raw";

const md = markdownit({
    html: true,
    linkify: true,
    typographer: false,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) {
                /** empty */
            }
        }

        return ""; // use external default escaping
    },
});

const styles = [
    "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css' />",
    "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css' />",
    `<style>${oneDarkLightCSS}</style>`,
];

md.use(mk);
// md.use(mt);

export async function convertMarkdownToHtml(mdStr: string): Promise<string> {
    const html = `<div>${styles.join("")}<div class="markdown-body">${md.render(
        mdStr
    )}</div></div>`;

    return html;
}
