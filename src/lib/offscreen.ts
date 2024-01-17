import { CSBgRuntimeMsgAction, HTMLToImageOptions, HTMLToImageRequest } from "@/types/messaging";

export const imageFromHtml = async (html: string, options?: HTMLToImageOptions) => {
    const msg: HTMLToImageRequest = {
        action: CSBgRuntimeMsgAction.HTMLToImage,
        html: html,
        options,
    };

    const response = await chrome.runtime.sendMessage(msg);
    return response;
};
