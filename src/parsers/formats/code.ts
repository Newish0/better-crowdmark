import { HtmlToImg, Utils } from "@src/externals/text-as-img/";
import { StyleType, type Style } from "@src/externals/text-as-img/src/markdown/types";
import { ParsedFile, Parser } from "../types";
import { dataURLToBlob } from "@src/utils/convert";
import { getExtension, removeExtension } from "@src/utils/fs";
import hljs from "highlight.js";
import hljsCss from "highlight.js/styles/github.min.css?raw";

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

/**
 * Code Parser (HighlightJS Parser)
 * @returns
 */
const codeParser: Parser = () => {
    return {
        name: "Code Parser",
        slug: "code",
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

            const styles: Style[] = [
                {
                    type: StyleType.Inline,
                    content: hljsCss,
                },
                {
                    type: StyleType.Inline,
                    content: scalingCss,
                },
            ];

            const html = `
                <div>
                    ${styles.map((style) => Utils.tagFromStyle(style)).join("")}
                    <pre>
                        <code>${result.value}</code>
                    </pre>
                </div>`;
            const dataUrl = await HtmlToImg.convert(html, {
                margin: "0.1rem",
                width:"max(auto, 8.5in)",
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
export default codeParser;
