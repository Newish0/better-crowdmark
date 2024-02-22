import { HtmlToImg } from "@src/externals/text-as-img/";
import { ParsedFile, Parser } from "../types";
import { dataURLToBlob } from "@src/utils/convert";
import { removeExtension } from "@src/utils/fs";

const svgModule: Parser = () => {
    return {
        name: "SVG",
        slug: "svg",
        extensions: [".svg"],
        authors: [
            {
                name: "Newish0",
                github: "github.com/Newish0",
            },
        ],
        async parse(svgFile: File) {
            const svgData = await svgFile.text();
            const dataUrl = await HtmlToImg.convert(svgData, {
                margin: "0px",
                width: "min-content",
            });
            if (!dataUrl) throw new Error("Failed to parse text file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(svgFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default svgModule;
