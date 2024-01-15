import browser from "webextension-polyfill";

import katex from "katex";
import { RenderKatexRequest, RuntimeMsgAction } from "./types/messaging";

browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details);
});

const handleRenderKatex = (
    request: RenderKatexRequest,
    sender: browser.Runtime.MessageSender,
    sendResponse: Function
) => {
    const html = katex.renderToString(request.katex, request.options);
    sendResponse(html);
};

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case RuntimeMsgAction.RenderKatex:
            handleRenderKatex(request, sender, sendResponse);
            break;
        default:
            console.error(
                "Unhandled runtime message from",
                sender.tab,
                "at URL",
                sender.tab?.url,
                "with request",
                request
            );
    }
});
