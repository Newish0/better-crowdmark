import katex from "katex";
import {
    HTMLToImageRequest,
    MsgHandler,
    RenderKatexRequest,
    CSBgRuntimeMsgAction,
    OsHTMLToImageRequest,
    BgOsRuntimeMsgAction,
    OsHTMLToImageResponse,
} from "./types/messaging";

chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details);
});

const handleRenderKatex: MsgHandler = (request: RenderKatexRequest, sender, sendResponse) => {
    const html = katex.renderToString(request.katex, request.options);
    sendResponse(html);
};

let creating: Promise<void> | null = null; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path: string) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl],
    });

    if (existingContexts.length > 0) {
        return;
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: [chrome.offscreen.Reason.DOM_PARSER, chrome.offscreen.Reason.BLOBS],
            justification: "Converting HTML string to image.",
        });
        await creating;
        creating = null;
    }
}

const handleHTMLToImage: MsgHandler = async (request: HTMLToImageRequest, sender, sendResponse) => {
    await setupOffscreenDocument("src/offscreen/index.html");

    const msg: OsHTMLToImageRequest = {
        ...request,
        target: "offscreen",
        action: BgOsRuntimeMsgAction.HTMLToImage,
        id: crypto.randomUUID(),
    };

    await new Promise<void>((resolve) => {
        const tmpHandler = (request: any) => {
            console.log("IN TMP HANDLER");
            if (request.action !== BgOsRuntimeMsgAction.HTMLToImage) return;

            const res = request as OsHTMLToImageResponse;
            sendResponse(res.response);
            console.log("FINALLY ", res.response);
            chrome.runtime.onMessage.removeListener(tmpHandler);
            resolve();
        };
        chrome.runtime.onMessage.addListener(tmpHandler);

        chrome.runtime.sendMessage(msg);
    });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case CSBgRuntimeMsgAction.RenderKatex:
            handleRenderKatex(request, sender, sendResponse);
            return;
        case CSBgRuntimeMsgAction.HTMLToImage:
            handleHTMLToImage(request, sender, sendResponse);
            return true;
        default:
            console.debug(
                "[Main Handler] Unhandled runtime message from",
                sender.tab,
                "at URL",
                sender.tab?.url,
                "with request",
                request
            );
    }
});
