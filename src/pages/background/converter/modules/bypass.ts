import { ConvertedFile, createModule } from "./index";

export const bypassModule = createModule({
    name: "Crowdmark Defaults",
    slug: "bypass",
    description: "The default files Crowdmark supports.",
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".jfif", ".pjpeg", ".pjp"],
    convert: (file: File) => {
        return file as ConvertedFile;
    },
});
