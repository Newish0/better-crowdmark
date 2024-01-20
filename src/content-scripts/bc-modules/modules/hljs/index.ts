import { BCModule, ParsedFile } from "@/types/bc-module";
import { dataURLToBlob, getExtension, removeExtension } from "../../services/utils";

import hljs from "highlight.js";
import hljsCss from "highlight.js/styles/github.min.css?raw";
import { imageFromHtml } from "@/content-scripts/bc-modules/services/utils";

hljs.registerAliases("m", { languageName: "matlab" });
const extensions: `.${string}`[] = [
    ".asm",
    ".bash",
    ".cc",
    ".c",
    ".cljc",
    ".cljs",
    ".clj",
    ".clojure",
    ".cpp",
    ".cs",
    ".css",
    ".dart",
    ".ejs",
    ".groovy",
    ".h",
    ".hpp",
    ".java",
    ".jsx",
    ".js",
    ".json",
    ".kotlin",
    ".less",
    ".lua",
    ".m",
    ".mathml",
    ".mysql",
    ".pgsql",
    ".perl",
    ".php",
    ".php3",
    ".php4",
    ".php5",
    ".pl",
    ".plsql",
    ".pod",
    ".powershell",
    ".ps1",
    ".psm1",
    ".py",
    ".rb",
    ".rss",
    ".rs",
    ".ruby",
    ".sass",
    ".scala",
    ".scss",
    ".shell",
    ".sh",
    ".sql",
    ".swift",
    ".toml",
    ".ts",
    ".tsx",
    ".vb",
    ".vba",
    ".vbs",
    ".vue",
    ".xml",
    ".yaml",
    ".yml",
    ".zsh",
];

const scalingCss = `
        pre {
            height: max-content;
            font-size: 1.2rem;
        }
    `;

const HLJSModule: BCModule = () => {
    return {
        name: "HighlightJS",
        slug: "highlight-js",
        extensions,
        description:
            "Adds support for many programming languages with syntax highlighting (using HighlighJS).",
        authors: [
            {
                name: "Newish0",
                github: "github.com/Newish0",
            },
        ],
        async parse(codeFile: File) {
            const plainText = await codeFile.text();
            const ext = getExtension(codeFile.name);
            const result = hljs.highlightAuto(plainText, [ext.slice(1)]);
            const html = `<pre><code>${result.value}</code></pre>`;
            const dataUrl = await imageFromHtml(html, {
                cssStyles: [hljsCss, scalingCss],
                margin: "0.1rem",
                pixelRatio: 3,
            });
            if (!dataUrl) throw new Error("Failed to parse hljs file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(codeFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default HLJSModule;
