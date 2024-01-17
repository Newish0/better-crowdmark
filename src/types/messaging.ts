/**
 * For comm between content-script and background (service worker) script.
 */
export enum CSBgRuntimeMsgAction {
    RenderKatex,
    HTMLToImage,
}

/**
 * For comm between background (service worker) and offscreen.
 */
export enum BgOsRuntimeMsgAction {
    HTMLToImage = "BG_OS_HTML_TO_IMAGE",
}

export type MsgHandler = (
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) => void;

export type RenderKatexRequest = {
    action: CSBgRuntimeMsgAction.RenderKatex;
    katex: string;
    options?: katex.KatexOptions;
};

export type RenderKatexResponse = string;

export type HTMLToImageOptions = {
    cssStyles?: string[];
    width?: string;
    margin?: string;
};

type HTMLToImageRequestPayload = {
    html: string;
    options?: HTMLToImageOptions;
};

export type HTMLToImageRequest = HTMLToImageRequestPayload & {
    action: CSBgRuntimeMsgAction.HTMLToImage;
};

export type HTMLToImageResponse = string;

export type OsHTMLToImageRequest = HTMLToImageRequestPayload & {
    target: "offscreen";
    action: BgOsRuntimeMsgAction.HTMLToImage;
    id: string;
};

export type OsHTMLToImageResponse = {
    action: BgOsRuntimeMsgAction.HTMLToImage;
    id: string;
    response: HTMLToImageResponse;
};
