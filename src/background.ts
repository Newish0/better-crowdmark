import browser from "webextension-polyfill";

import katex from "katex";
import { RenderKatexRequest, RuntimeMsgAction } from "./types/messaging";
// const testHTML = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}", {
//     throwOnError: false,
// });

// console.log("testHTML", testHTML);

console.log("Hello from the background!");

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
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

    switch (request.action) {
        case RuntimeMsgAction.RenderKatex:
            handleRenderKatex(request, sender, sendResponse);
            break;
        default:
            console.error("Unhandled runtime message", request);
    }
});
