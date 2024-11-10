// background/offscreen-service.ts

import { onMessage, sendMessage } from "@/messaging/bg-offscreen";
import { type htmlToPngDataUrl } from "@/utils/html-to-png";

export class OffscreenService {
    private static readonly DEFAULT_TIMEOUT = import.meta.env.DEV ? 3600 * 1000 : 30 * 1000; // 30 seconds by default in production

    private static instance: OffscreenService;
    private offscreenCreating: Promise<void> | null = null;
    private offscreenTimeoutTracker: ReturnType<typeof setTimeout> | null = null;
    private readyResolver: ((value: void) => void) | null = null;
    private offscreenReadyPromise: Promise<void> | null = null;
    private setupLock: Promise<void> | null = null;

    private constructor(
        private readonly documentPath: string = "src/pages/offscreen/index.html",
        private readonly timeout: number = OffscreenService.DEFAULT_TIMEOUT
    ) {
        this.setupMessageListener();
    }

    public static getInstance(documentPath?: string, timeout?: number): OffscreenService {
        if (!OffscreenService.instance) {
            OffscreenService.instance = new OffscreenService(documentPath, timeout);
        }
        return OffscreenService.instance;
    }

    public async testOffscreen(): Promise<void> {
        await this.setupOffscreenDocument();
        if (!(await this.hasOffscreenDocument())) {
            throw new Error("Offscreen document not found");
        }
    }

    /**
     * Sets up single message listener for offscreen ready signal
     */
    private setupMessageListener(): void {
        onMessage("offscreenReady", () => {
            console.debug("[OffscreenService] Received ready signal from offscreen");
            if (this.readyResolver) {
                this.readyResolver();
                this.readyResolver = null;
            }
        });
    }

    /**
     * Ensures the offscreen document exists and resets the timeout.
     * Creates the document if it doesn't exist.
     */
    private async setupOffscreenDocument(): Promise<void> {
        // If there's an ongoing setup, wait for it to complete
        if (this.setupLock) {
            await this.setupLock;
            return;
        }

        // Create a new setup operation
        this.setupLock = this.performSetup();
        try {
            await this.setupLock;
        } finally {
            this.setupLock = null;
        }
    }

    /**
     * Performs the actual setup operation
     */
    private async performSetup(): Promise<void> {
        console.debug("[OffscreenService] Setting up offscreen document");

        // Reset timeout
        this.resetTimeout();

        // First, check if we're already creating
        if (this.offscreenCreating) {
            console.debug("[OffscreenService] Waiting for existing creation to complete");
            await this.offscreenCreating;
            return;
        }

        // Then check if document exists
        const hasDocument = await this.hasOffscreenDocument();
        if (!hasDocument) {
            console.debug("[OffscreenService] Document doesn't exist, creating new one");
            try {
                // Create new ready promise before creating document
                this.createReadyPromise();

                // Start creation
                this.offscreenCreating = this.createOffscreenDocument();
                await this.offscreenCreating;

                // Wait for ready signal
                await this.offscreenReadyPromise;
            } finally {
                this.offscreenCreating = null;
            }
        }

        console.debug("[OffscreenService] Offscreen document is ready");
    }

    /**
     * Creates a new promise to wait for offscreen ready signal
     */
    private createReadyPromise(): Promise<void> {
        // Clean up existing promise if there is one
        this.readyResolver = null;
        this.offscreenReadyPromise = new Promise<void>((resolve) => {
            this.readyResolver = resolve;
        });
        return this.offscreenReadyPromise;
    }

    /**
     * Creates the offscreen document with specified reasons and justification
     */
    private async createOffscreenDocument(): Promise<void> {
        console.log("CREATE OFFSCREEN FROM", this.documentPath);

        return chrome.offscreen.createDocument({
            url: this.documentPath,
            reasons: [chrome.offscreen.Reason.DOM_PARSER, chrome.offscreen.Reason.BLOBS],
            justification: "Converting HTML string to image and parsing markdown",
        });
    }

    /**
     * Checks if the offscreen document exists
     */
    private async hasOffscreenDocument(): Promise<boolean> {
        if ("getContexts" in chrome.runtime) {
            const offscreenUrl = chrome.runtime.getURL(this.documentPath);
            const contexts = await chrome.runtime.getContexts({
                contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
                documentUrls: [offscreenUrl],
            });
            return contexts.length > 0;
        }
        console.error("[OffscreenService] Runtime.getContexts not supported");
        return false;
    }

    /**
     * Resets the timeout that will close the offscreen document
     */
    private resetTimeout(): void {
        if (this.offscreenTimeoutTracker) {
            clearTimeout(this.offscreenTimeoutTracker);
        }
        this.offscreenTimeoutTracker = setTimeout(
            () => this.closeOffscreenDocument(),
            this.timeout
        );
    }

    /**
     * Closes the offscreen document and cleans up
     */
    private async closeOffscreenDocument(): Promise<void> {
        console.debug("[OffscreenService] Closing offscreen document");
        try {
            await chrome.offscreen.closeDocument();
            if (this.offscreenTimeoutTracker) {
                clearTimeout(this.offscreenTimeoutTracker);
                this.offscreenTimeoutTracker = null;
            }
        } catch (error) {
            console.error("[OffscreenService] Error closing document:", error);
        }
    }

    /**
     * Converts HTML to image
     */
    public async convertHtmlToImage(...args: Parameters<typeof htmlToPngDataUrl>): Promise<string> {
        await this.setupOffscreenDocument();

        console.debug("[OffscreenService] Converting HTML to image at", Date.now());

        try {
            return await sendMessage("convertHtmlToImage", args);
        } catch (error) {
            console.error("[OffscreenService] HTML to image conversion failed:", error);
            throw error;
        }
    }

    /**
     * Renders markdown to HTML
     */
    public async renderMarkdownToHtml(md: string): Promise<string> {
        console.debug("[OffscreenService] Got request to render markdown to HTML");

        await this.setupOffscreenDocument();

        console.debug("[OffscreenService] Rendering markdown to HTML at", Date.now());

        try {
            return await sendMessage("renderMarkdownToHtml", md);
        } catch (error) {
            console.error("[OffscreenService] Markdown to HTML conversion failed:", error);
            throw error;
        }
    }

    /**
     * Manually close the offscreen document if needed
     */
    public async dispose(): Promise<void> {
        await this.closeOffscreenDocument();
    }
}
