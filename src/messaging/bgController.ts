import { MessageRequest, MessageType } from "./types";

/**
 * Distribute message type to individual handlers
 * @param runtime
 */
export default function bgController(runtime: typeof chrome.runtime) {
    runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse) => {
        switch (request.type) {
            case MessageType.FileToImage:
                handleFileToImage(request, sender, sendResponse);
                return true;
            default:
                console.warn("Unhandled message from", sender.url);
        }
    });

    let creating: Promise<void> | null = null; // A global promise to avoid concurrency issues
    async function setupOffscreenDocument(path: string) {
        if (await hasOffscreenDocument()) return;

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

    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    async function hasOffscreenDocument() {
        if ("getContexts" in runtime) {
            const contexts = await runtime.getContexts({
                contextTypes: ["OFFSCREEN_DOCUMENT"],
                documentUrls: [OFFSCREEN_DOCUMENT_PATH],
            });
            return Boolean(contexts.length);
        } else {
            const matchedClients = await clients.matchAll();
            return await matchedClients.some((client) => {
                client.url.includes(runtime.id);
            });
        }
    }

    async function handleFileToImage(
        request: MessageRequest,
        sender: chrome.runtime.MessageSender,
        sendResponse: (res?: any) => void
    ) {}
}
