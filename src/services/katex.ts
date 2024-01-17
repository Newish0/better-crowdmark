import { RenderKatexRequest, RenderKatexResponse, CSBgRuntimeMsgAction } from "@/types/messaging";


export const katexToHtml = async (katex: string, options?: katex.KatexOptions) => {
    const msg: RenderKatexRequest = {
        action: CSBgRuntimeMsgAction.RenderKatex,
        katex,
        options,
    };
    const html: RenderKatexResponse = await chrome.runtime.sendMessage(msg);
    return html;
};
