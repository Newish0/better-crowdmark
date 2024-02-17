import {
    FileToImageRequest,
    MessageRequest,
    MessageType,
    SerializedFile,
    _OffBgFileToImageRequest,
} from "./types";

const OFFSCREEN_DOCUMENT_PATH = "src/pages/offscreen/index.html";

export default function bgController(runtime: typeof chrome.runtime) {
    /**
     * Distribute message type to individual handlers
     */
    runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse) => {
        switch (request.type) {
            case MessageType.FileToImage:
                handleFileToImage(request as FileToImageRequest, sender, sendResponse);
                return true;
            default:
                console.warn("Unhandled message from", sender.url);
        }
    });

    let creating: Promise<void> | null = null; // A global promise to avoid concurrency issues
    async function setupOffscreenDocument(path = OFFSCREEN_DOCUMENT_PATH) {
        console.debug("Setting up offscreen document");

        if (await hasOffscreenDocument(path)) {
            console.debug("Offscreen document already exist");
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

        console.debug("Offscreen document created");
    }

    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    async function hasOffscreenDocument(path: string) {
        if ("getContexts" in runtime) {
            const offscreenUrl = chrome.runtime.getURL(path);
            const contexts = await runtime.getContexts({
                contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
                documentUrls: [offscreenUrl],
            });
            return Boolean(contexts.length);
        } else {
            console.error("No supported.");
        }
    }

    async function handleFileToImage(
        request: FileToImageRequest,
        sender: chrome.runtime.MessageSender,
        sendResponse: (imageFile: SerializedFile | null) => void
    ) {
        await setupOffscreenDocument();

        console.debug("handleFileToImage request:", request);

        const msg: _OffBgFileToImageRequest = {
            type: MessageType._OffBgFileToImage,
            target: "offscreen",
            data: request.data,
        };

        const imageFile: SerializedFile = await chrome.runtime.sendMessage(msg);

        console.debug("MessageType._OffBgFileToImage response", imageFile);

        sendResponse(imageFile);
    }
}
