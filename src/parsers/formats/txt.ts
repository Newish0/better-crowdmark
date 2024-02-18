import { HtmlToImg } from "@src/externals/text-as-img/";
import { ParsedFile, Parser } from "../types";
import { dataURLToBlob } from "@src/utils/convert";
import { removeExtension } from "@src/utils/fs";

const textParser: Parser = () => {
    return {
        name: "Text",
        slug: "text",
        extensions: [".txt"],
        async parse(txtFile: File) {
            const txt = await txtFile.text();
            const html = `<pre>${txt}</pre>`;
            const dataUrl = await HtmlToImg.convert(html);
            if (!dataUrl) throw new Error("Failed to parse text file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(txtFile.name)}.png`
            ) as ParsedFile;
        },
    };
};
export default textParser;
