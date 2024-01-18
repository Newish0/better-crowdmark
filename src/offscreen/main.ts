import { validURL } from "@/content-scripts/bc-modules/utils";
import {
    BgOsRuntimeMsgAction,
    HTMLToImageOptions,
    OsHTMLToImageRequest,
    OsHTMLToImageResponse,
} from "@/types/messaging";
import * as htmlToImage from "html-to-image";

/**
 *
 * @param html
 * @param cssStyles
 * @returns PNG data URL
 */
export const imageFromHtml = async (
    html: string,
    { cssStyles = [], width = "8.5in", margin = "0.5in" }: HTMLToImageOptions = {}
) => {
    const root = document.querySelector("#root")!;

    const iframe = document.createElement("iframe");

    // Set the source to 'about:blank' initially
    iframe.src = "about:blank";

    // Set the dimensions of the iframe
    iframe.width = width;

    root.appendChild(iframe);

    Object.assign(iframe.style, {
        position: "absolute",
        width,
        margin: 0,
        padding: 0,
        border: 0,
        fontSize: `100%`,
        font: `inherit`,
        verticalAlign: `baseline`,
    });

    const iDoc = iframe.contentDocument;
    const iWin = iframe.contentWindow;

    if (!iDoc || !iWin) throw new Error("iframe document/window are undefined");

    const loadPromise = new Promise<unknown>((r) => {
        // for waiting iframe content to load
        iframe.addEventListener("load", r);
    });

    // Inject CSS
    for (const css of cssStyles) {
        if (validURL(css)) html += `<link rel="stylesheet" href="${css}" crossorigin="anonymous"/>`;
        else html += `<style>${css}</style>`;
    }

    iDoc.open();
    iDoc.write(html);
    iDoc.close();

    await loadPromise;

    iDoc.body.style.padding = margin;
    iDoc.body.style.backgroundColor = "#fff";

    // Ensure full height is visible
    iframe.height = `${iDoc.body.scrollHeight}px`;

    const dataUrl = await htmlToImage.toPng(iDoc.body, {
        pixelRatio: 2,
        backgroundColor: "#fff",
    });

    // Cleanup
    root.removeChild(iframe);

    return dataUrl;
};

chrome.runtime.onMessage.addListener(async (request: OsHTMLToImageRequest) => {
    console.debug("[Offscreen] receive request");

    const pngDataUrl = await imageFromHtml(request.html, request.options);

    const msg: OsHTMLToImageResponse = {
        action: BgOsRuntimeMsgAction.HTMLToImage,
        response: pngDataUrl ?? "",
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
