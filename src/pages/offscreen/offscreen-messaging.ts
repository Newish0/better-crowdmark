// offscreen.ts
import { onMessage, sendMessage } from "@/messaging/bg-offscreen";
import { htmlToPngDataUrl } from "@/utils/html-to-png";
import { convertMarkdownToHtml } from "./markdown-to-html";

// Implementation of the HTML to image conversion
async function convertHtmlToImageImpl(
    ...args: Parameters<typeof htmlToPngDataUrl>
): Promise<string> {
    return htmlToPngDataUrl(...args);
}

// Implementation of the markdown to HTML conversion
async function renderMarkdownToHtmlImpl(md: string): Promise<string> {
    return convertMarkdownToHtml(md);
}

// Register message handlers in offscreen
export async function initOffscreenMessaging() {
    console.debug("[Offscreen] Initializing offscreen messaging at", Date.now());

    // Handle HTML to image conversion requests
    onMessage("convertHtmlToImage", async (message) => {
        try {
            const result = await convertHtmlToImageImpl(...message.data);
            return result;
        } catch (error) {
            console.error("Error converting HTML to image:", error);
            throw error;
        }
    });

    // Handle markdown to HTML conversion requests
    onMessage("renderMarkdownToHtml", async (message) => {
        try {
            const result = await renderMarkdownToHtmlImpl(message.data);
            return result;
        } catch (error) {
            console.error("Error rendering markdown to HTML:", error);
            throw error;
        }
    });

    // Signal to background that initialization is complete
    await sendMessage("offscreenReady", undefined);
}
