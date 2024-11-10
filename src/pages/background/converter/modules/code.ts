import { ConvertedFile, createModule } from "./index";
import hljs from "highlight.js";
import hljsCss from "highlight.js/styles/github.min.css?raw";
import { dataURLToBlob } from "@/utils/convert";
import { getExtension, removeExtension } from "@/utils/path";
import { OffscreenService } from "@/pages/background/offscreen-service";

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

const additionalCss = `
        pre {
            height: max-content;
            font-size: 1.2rem;
        }
    `;

export const codeSyntaxHighlightModule = createModule({
    name: "Code Syntax Highlighter",
    slug: "code-syntax-highlighter",
    description:
        "Adds support for many programming languages with syntax highlighting (using HighlighJS).",
    extensions: extensions,
    convert: async (file: File) => {
        const plainText = await file.text();
        const ext = getExtension(file.name, false);

        if (!ext) {
            throw new Error("File has no extension");
        }

        const result = hljs.highlightAuto(plainText, [ext]);

        const styleTags = [hljsCss, additionalCss]
            .map((style) => {
                return `<style>${style}</style>`;
            })
            .join("");

        const html = `${styleTags}<pre><code>${result.value}</code></pre>`;

        const offscreenService = OffscreenService.getInstance();

        const dataUrl = await offscreenService.convertHtmlToImage(html);

        return new File(
            [await dataURLToBlob(dataUrl)],
            `${removeExtension(file.name)}.png`
        ) as ConvertedFile;
    },
});
