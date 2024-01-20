import { BCModule, ParsedFile } from "@/types/bc-module";
import { dataURLToBlob, removeExtension } from "../../services/utils";
import { imageFromHtml } from "@/content-scripts/bc-modules/services/utils";

const svgModule: BCModule = () => {
    return {
        name: "SVG",
        slug: "svg",
        extensions: [".svg"],
        async parse(svgFile: File) {
            const svgData = await svgFile.text();
            const dataUrl = await imageFromHtml(svgData, { margin: "0px", width: "min-content" });
            if (!dataUrl) throw new Error("Failed to parse text file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(svgFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default svgModule;
