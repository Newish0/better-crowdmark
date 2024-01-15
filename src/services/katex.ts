import { RenderKatexRequest, RenderKatexResponse, RuntimeMsgAction } from "@/types/messaging";
import browser from "webextension-polyfill";

export const katexToHtml = async (katex: string, options?: katex.KatexOptions) => {
    const msg: RenderKatexRequest = {
        action: RuntimeMsgAction.RenderKatex,
        katex,
        options,
    };
    const html: RenderKatexResponse = await browser.runtime.sendMessage(msg);
    return html;
};
