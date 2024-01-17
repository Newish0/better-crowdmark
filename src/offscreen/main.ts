import { injectStyle } from "@/content-scripts/bc-modules/utils";
import {
    BgOsRuntimeMsgAction,
    HTMLToImageOptions,
    OsHTMLToImageRequest,
    OsHTMLToImageResponse,
} from "@/types/messaging";
import * as htmlToImage from "html-to-image";

const imageFromHtml = (
    html: string | HTMLElement,
    { cssStyles = [], width = "8.5in", margin = "0.5in" }: HTMLToImageOptions = {}
) => {
    /**
     * Converts HTML image in an isolated context/document
     * @param htmlStr
     * @returns
     */
    const htmlStrToImg = async (htmlStr: string) => {
        const root: HTMLDivElement = document.querySelector("#root")!;
        const cssCleanups = cssStyles.map((style) => injectStyle(style, document, root));
        root.innerHTML = htmlStr;

        return new Promise<string>((r) => {
            const process = async () => {
                Object.assign(root.style, {
                    padding: margin,
                    backgroundColor: "#fff",
                    width,
                });

                // root.style.height = `calc(${
                //     root.getBoundingClientRect().height
                // }px + ${margin} * 2)`; // Ensure full height is visible

                const dataUrl = await htmlToImage.toPng(root, {
                    pixelRatio: 2,
                    backgroundColor: "#fff",
                });

                r(dataUrl);

                // Cleanup
                cssCleanups.forEach((c) => c());
                root.innerHTML = "";
            };

            if (document.readyState === "complete") process();
            else window.addEventListener("load", process);
        });
    };

    if (typeof html === "string") {
        return htmlStrToImg(html);
    } else {
        return htmlStrToImg(html.outerHTML);
    }
};

chrome.runtime.onMessage.addListener(async (request: OsHTMLToImageRequest) => {
    console.debug("[Offscreen] receive request");

    const pngDataUrl = await imageFromHtml(request.html, request.options);
    console.log("PNG", pngDataUrl);

    const msg: OsHTMLToImageResponse = {
        action: BgOsRuntimeMsgAction.HTMLToImage,
        response: pngDataUrl,
        id: request.id,
    };
    chrome.runtime.sendMessage(msg);

    // switch (request.action) {
    //     case BgOsRuntimeMsgAction.HTMLToImage:
    //         const pngDataUrl = await imageFromHtml(request.html, request.options);
    //         sendResponse(pngDataUrl);
    //         break;
    //     default:
    //         console.error(
    //             "Unhandled runtime message from",
    //             sender.tab,
    //             "at URL",
    //             sender.tab?.url,
    //             "with request",
    //             request
    //         );
    // }
});
