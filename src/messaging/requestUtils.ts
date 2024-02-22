/**
 * 
 * > ***This file should ONLY be used in content scripts.***
 * 
 * Use provided functions to send messages or call background/offscreen
 * functions from the content script or places that needs it.
 */

import { deserializeFile, serializeFile } from "./serialization";
import { FileToImageRequest, MessageRequest, MessageType, SerializedFile } from "./types";

export async function fileToImage(file: File): Promise<File | null> {
    const msg: FileToImageRequest = {
        type: MessageType.FileToImage,
        data: await serializeFile(file),
    };

    console.debug("[content script] fileToImage send msg:", msg);

    const serializedFile: SerializedFile = await chrome.runtime.sendMessage(msg);
    const imageFile = await deserializeFile(serializedFile);

    console.debug("[content script]fileToImageRes, imageFile:", imageFile, "was serialized as", serializedFile);

    return imageFile;
}

export async function getSupportedFormats() {
    const msg: MessageRequest = {
        type: MessageType.SupportedFormats,
    };
    const formats: string[] = await chrome.runtime.sendMessage(msg);
    return formats;
}
