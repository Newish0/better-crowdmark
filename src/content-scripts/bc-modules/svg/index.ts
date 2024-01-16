import { BCModule, ParsedFile } from "@/types/bc-module";
import { dataURLToBlob, imageFromHTML, removeExtension } from "../utils";

const svgModule: BCModule = () => {
    return {
        name: "SVG",
        extensions: [".svg"],
        async parse(svgFile: File) {
            const svgData = await svgFile.text();
            const dataUrl = await imageFromHTML(svgData, { margin: "0px", width: "min-content" });
            if (!dataUrl) throw new Error("Failed to parse text file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(svgFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default svgModule;
