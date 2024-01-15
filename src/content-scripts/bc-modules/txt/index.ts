import { BCModule, ParsedFile } from "@/types/bc-module";
import { dataURLToBlob, imageFromHTML, removeExtension } from "../utils";

const TextModule: BCModule = () => {
    return {
        name: "Text",
        extensions: [".txt"],
        async parse(txtFile: File) {
            const txt = await txtFile.text();
            const html = `<pre>${txt}</pre>`;
            const dataUrl = await imageFromHTML(html);
            if (!dataUrl) throw new Error("Failed to parse text file.");
            return new File(
                [await dataURLToBlob(dataUrl)],
                `${removeExtension(txtFile.name)}.png`
            ) as ParsedFile;
        },
    };
};

export default TextModule;
