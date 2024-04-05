import { ParsedFile, Parser } from "../types";

const defaultParser: Parser = () => {
    return {
        name: "Crowdmark Default",
        slug: "crowdmark-default",
        extensions: [".pdf", ".jpg", ".jpeg", ".png", ".jfif", ".pjpeg", ".pjp"],
        authors: [
            {
                name: "Newish0",
                github: "github.com/Newish0",
            },
        ],
        async parse(file: File) {
            return file as ParsedFile;
        },
    };
};
export default defaultParser;
