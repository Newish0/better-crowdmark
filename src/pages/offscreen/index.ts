import { deserializeFile, serializeFile } from "@src/messaging/serialization";
import {
    MessageRequest,
    MessageType,
    SerializedFile,
    _OffBgFileToImageRequest,
} from "@src/messaging/types";
import { parse } from "@src/parsers";

chrome.runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse) => {
    console.debug("[Offscreen] receive request");

    switch (request.type) {
        case MessageType._OffBgFileToImage:
            handleFileToImage(request as _OffBgFileToImageRequest, sender, sendResponse);
            return true;
        default:
            console.debug("[Offscreen] Unhandled message from", sender.url);
    }
});

async function handleFileToImage(
    request: _OffBgFileToImageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (imageFile: SerializedFile | null) => void
) {
    const file = await deserializeFile(request.data);
    if (!file) return null;

    console.debug("[Offscreen] Got file", file);

    const parsedFile = await parse(file);

    if (!parsedFile) {
        sendResponse(null);
        return;
    }

    sendResponse(await serializeFile(parsedFile));
}
