import { BCModule, ParsedFile } from "@/types/bc-module";
import { dataURLToBlob, getExtension, imageFromHTML, removeExtension } from "../utils";

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
    ".h++",
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

const HLJSModule: BCModule = () => {
    return {
        name: "HighlightJS",
        extensions,
        async parse(codeFile: File) {
            const plainText = await codeFile.text();
            const ext = getExtension(codeFile.name);
            const result = hljs.highlightAuto(plainText, [ext.slice(1)]);
            const html = `<pre style="height: max-content"><code>${result.value}</code></pre>`;
            const dataUrl = await imageFromHTML(html, { cssStyles: [hljsCss], margin: "0.1rem" });
            if (!dataUrl) throw new Error("Failed to parse hljs file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(codeFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default HLJSModule;