import { OffscreenService } from "@/pages/background/offscreen-service";
import { ConvertedFile, createModule } from "./index";
import { dataURLToBlob } from "@/utils/convert";
import { removeExtension } from "@/utils/path";

const spacingCss = `
    body {
        padding: 2rem;
    }
}`;

export const markdownModule = createModule({
    name: "Markdown",
    slug: "markdown",
    extensions: [".md"],
    description:
        "Adds markdown file support with markdown math (Katex), and more. Implemented using part of VSCode's parser, so the results should be quite similar!",
    async convert(file: File) {
        const offscreenService = OffscreenService.getInstance();

        const mdText = await file.text();

        let html = await offscreenService.renderMarkdownToHtml(mdText);
        html = `<style>${spacingCss}</style>${html}`;

        const imgDataUrl = await offscreenService.convertHtmlToImage(html, {
            inlineResources: true,
            backgroundColor: "#fff",
        });
        const convertedFile = new File(
            [await dataURLToBlob(imgDataUrl)],
            `${removeExtension(file.name)}.png`
        );

        return convertedFile as ConvertedFile;
    },
});
