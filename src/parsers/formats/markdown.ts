import { dataURLToBlob } from "@src/utils/convert";
import { ParsedFile, Parser } from "../types";
import { Md, HtmlToImg, Utils } from "@src/externals/text-as-img/";
import { removeExtension } from "@src/utils/fs";

const markdownParser: Parser = () => {
    return {
        name: "Markdown",
        slug: "markdown",
        extensions: [".md"],
        description:
            "Adds markdown file support with markdown math (Katex), and more. Implemented using part of VSCode's parser, so the results should be quite similar!",
        authors: [
            {
                name: "Newish0",
                github: "github.com/Newish0",
            },
        ],
        async parse(markdownFile: File) {
            const html = Md.parse(await markdownFile.text());
            const imgDataUrl = await HtmlToImg.convert(`
            <div>
              ${Md.getStyles()
                  .map((style) => Utils.tagFromStyle(style))
                  .join("")}
              ${html}  
            </div>
          `);
            return new File(
                [await dataURLToBlob(imgDataUrl)],
                `${removeExtension(markdownFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default markdownParser;
