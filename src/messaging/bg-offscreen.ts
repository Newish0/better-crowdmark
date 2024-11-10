// messaging/bg-offscreen.ts

import { type htmlToPngDataUrl } from "@/utils/html-to-png";
import { defineExtensionMessaging } from "@webext-core/messaging";

// Define the protocol map for our messaging system
interface ProtocolMap {
    convertHtmlToImage(data: [...args: Parameters<typeof htmlToPngDataUrl>]): Promise<string>;
    renderMarkdownToHtml(md: string): Promise<string>;
    offscreenReady(): void; // offscreen finished initialization signal to background
}

// Create and export the messaging utilities
export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
