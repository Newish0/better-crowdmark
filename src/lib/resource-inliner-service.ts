/**
 * Configuration options for resource inlining
 */
interface ResourceInlinerOptions {
    /** Maximum size in bytes for resources to inline. Default 5MB */
    maxSize?: number;
    /** Timeout in milliseconds for fetching resources. Default 5000ms */
    timeout?: number;
    /** Base URL for resolving relative URLs */
    baseUrl: string;
    /** Maximum concurrent requests. Default 5 */
    maxConcurrent?: number;
    /** Whether to skip resources that fail to load. Default true */
    skipFailedResources?: boolean;
    /** Custom logger implementation */
    logger?: ResourceInlinerLogger;
}

/**
 * Logger interface for ResourceInliner
 */
interface ResourceInlinerLogger {
    warn: (message: string) => void;
    error: (message: string, error?: Error) => void;
    info: (message: string) => void;
}

/**
 * Error types specific to resource inlining
 */
class ResourceInlinerError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = "ResourceInlinerError";
    }
}

/**
 * Service for inlining external resources (fonts, styles, images) within HTML and CSS content.
 */
export class ResourceInliner {
    private readonly options: Required<ResourceInlinerOptions>;
    private readonly logger: ResourceInlinerLogger;
    private readonly parser: DOMParser;
    private activeRequests = 0;

    constructor(options: ResourceInlinerOptions) {
        this.options = {
            maxSize: 5 * 1024 * 1024, // 5MB
            timeout: 5000,
            maxConcurrent: 5,
            skipFailedResources: true,
            logger: console,
            ...options,
        };
        this.logger = this.options.logger;
        this.parser = new DOMParser();
    }

    /**
     * Inlines all external resources in the provided HTML string
     * @param html - The HTML string to process
     * @returns Promise resolving to the processed HTML string with inlined resources
     * @throws ResourceInlinerError
     */
    public async inline(html: string): Promise<string> {
        try {
            const doc = this.parser.parseFromString(html, "text/html");
            if (doc.documentElement.querySelector("parsererror")) {
                throw new ResourceInlinerError("Failed to parse HTML", "PARSE_ERROR");
            }

            await Promise.all([
                this.processStylesheets(doc),
                this.processImages(doc),
                this.processFonts(doc),
            ]);

            return doc.documentElement.outerHTML;
        } catch (error) {
            if (error instanceof ResourceInlinerError) {
                throw error;
            }
            throw new ResourceInlinerError(
                `Failed to process HTML: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
                "PROCESSING_ERROR"
            );
        }
    }

    private async waitForAvailableSlot(): Promise<void> {
        while (this.activeRequests >= this.options.maxConcurrent) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.activeRequests++;
    }

    private releaseSlot(): void {
        this.activeRequests--;
    }

    private resolveUrl(url: string, baseUrl?: string): string {
        try {
            if (url.startsWith("http://") || url.startsWith("https://")) {
                new URL(url);
                return url;
            }

            return new URL(url, baseUrl || this.options.baseUrl).toString();
        } catch (error) {
            throw new ResourceInlinerError(
                `Invalid URL "${url}": ${error instanceof Error ? error.message : "Unknown error"}`,
                "INVALID_URL"
            );
        }
    }

    private async fetchWithTimeout(url: string): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        try {
            await this.waitForAvailableSlot();
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    throw new ResourceInlinerError(
                        `Request timeout after ${this.options.timeout}ms: ${url}`,
                        "TIMEOUT"
                    );
                } else if (
                    error.name === "TypeError" &&
                    error.message.includes("Failed to fetch")
                ) {
                    throw new ResourceInlinerError(
                        `Network error (possibly CORS): ${url}`,
                        "NETWORK_ERROR"
                    );
                }
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
            this.releaseSlot();
        }
    }

    private handleResourceError(type: string, resource: string, error: unknown): void {
        let errorMessage: string;
        let errorCode: string = "UNKNOWN_ERROR";

        if (error instanceof ResourceInlinerError) {
            errorMessage = error.message;
            errorCode = error.code;
        } else if (error instanceof Error) {
            errorMessage = error.message;
            if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
                errorCode = "NETWORK_ERROR";
            }
        } else {
            errorMessage = "Unknown error";
        }

        this.logger.error(
            `Failed to inline ${type} (${errorCode}): ${resource}\nReason: ${errorMessage}`,
            error instanceof Error ? error : undefined
        );

        if (!this.options.skipFailedResources) {
            throw new ResourceInlinerError(
                `Failed to process ${type} resource: ${errorMessage}`,
                errorCode
            );
        }
    }

    private async processStylesheets(doc: Document): Promise<void> {
        const styleLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        await Promise.all(
            styleLinks.map(async (link) => {
                try {
                    const href = link.getAttribute("href");
                    if (!href) return;

                    const absoluteUrl = this.resolveUrl(href);
                    const response = await this.fetchWithTimeout(absoluteUrl);
                    const size = parseInt(response.headers.get("content-length") || "0");

                    if (size > this.options.maxSize) {
                        this.logger.warn(`Skipping large stylesheet: ${href} (${size} bytes)`);
                        return;
                    }

                    let css = await response.text();
                    // Process CSS resources relative to the stylesheet's URL
                    css = await this.processCssResources(css, absoluteUrl);

                    const style = doc.createElement("style");
                    style.textContent = css;
                    link.parentNode?.replaceChild(style, link);
                } catch (error) {
                    this.handleResourceError("stylesheet", link.getAttribute("href") || "", error);
                }
            })
        );
    }

    private async processCssResources(css: string, baseUrl: string): Promise<string> {
        // Process url() declarations in CSS
        const urlPattern = /url\(['"]?([^'")\s]+)['"]?\)/g;
        const urls = Array.from(css.matchAll(urlPattern));

        for (const match of urls) {
            try {
                const [fullMatch, url] = match;
                // Skip data URLs and empty URLs
                if (!url || url.startsWith("data:")) continue;

                const absoluteUrl = this.resolveUrl(url, baseUrl);
                const response = await this.fetchWithTimeout(absoluteUrl);
                const size = parseInt(response.headers.get("content-length") || "0");

                if (size > this.options.maxSize) {
                    this.logger.warn(`Skipping large CSS resource: ${url} (${size} bytes)`);
                    continue;
                }

                const blob = await response.blob();
                const dataUrl = await this.blobToDataUrl(blob);
                css = css.replace(fullMatch, `url("${dataUrl}")`);
            } catch (error) {
                this.handleResourceError("CSS resource", match[1], error);
            }
        }

        // Process @import rules
        const importPattern = /@import\s+(['"]([^'"]+)['"]|url\(['"]?([^'")\s]+)['"]?\))/g;
        const imports = Array.from(css.matchAll(importPattern));

        for (const match of imports) {
            try {
                const [fullMatch, _, quotedUrl, urlFuncUrl] = match;
                const url = quotedUrl || urlFuncUrl;
                if (!url) continue;

                const absoluteUrl = this.resolveUrl(url, baseUrl);
                const response = await this.fetchWithTimeout(absoluteUrl);
                const size = parseInt(response.headers.get("content-length") || "0");

                if (size > this.options.maxSize) {
                    this.logger.warn(`Skipping large imported stylesheet: ${url} (${size} bytes)`);
                    continue;
                }

                let importedCss = await response.text();
                // Recursively process imported CSS
                importedCss = await this.processCssResources(importedCss, absoluteUrl);
                css = css.replace(fullMatch, importedCss);
            } catch (error) {
                this.handleResourceError("CSS @import", match[1], error);
            }
        }

        return css;
    }

    private async processImages(doc: Document): Promise<void> {
        const images = Array.from(doc.getElementsByTagName("img"));
        await Promise.all(
            images.map(async (img) => {
                try {
                    const src = img.getAttribute("src");
                    if (!src || src.startsWith("data:")) return;

                    const absoluteUrl = this.resolveUrl(src);
                    const response = await this.fetchWithTimeout(absoluteUrl);
                    const size = parseInt(response.headers.get("content-length") || "0");

                    if (size > this.options.maxSize) {
                        this.logger.warn(`Skipping large image: ${src} (${size} bytes)`);
                        return;
                    }

                    const blob = await response.blob();
                    const dataUrl = await this.blobToDataUrl(blob);
                    img.setAttribute("src", dataUrl);
                } catch (error) {
                    this.handleResourceError("image", img.getAttribute("src") || "", error);
                }
            })
        );
    }

    private async processFonts(doc: Document): Promise<void> {
        const fontFaces = Array.from(doc.querySelectorAll("style")).flatMap((style) => {
            return Array.from(style.sheet?.cssRules || []).filter(
                (rule) => rule instanceof CSSFontFaceRule
            ) as CSSFontFaceRule[];
        });

        await Promise.all(
            fontFaces.map(async (fontFace) => {
                try {
                    const urlMatch = fontFace.cssText.match(/url\(['"]?([^'"]+)['"]?\)/);
                    if (!urlMatch) return;

                    const fontUrl = urlMatch[1];
                    const absoluteUrl = this.resolveUrl(fontUrl);
                    const response = await this.fetchWithTimeout(absoluteUrl);
                    const size = parseInt(response.headers.get("content-length") || "0");

                    if (size > this.options.maxSize) {
                        this.logger.warn(`Skipping large font: ${fontUrl} (${size} bytes)`);
                        return;
                    }

                    const blob = await response.blob();
                    const dataUrl = await this.blobToDataUrl(blob);
                    fontFace.cssText = fontFace.cssText.replace(urlMatch[0], `url("${dataUrl}")`);
                } catch (error) {
                    this.handleResourceError("font", fontFace.cssText, error);
                }
            })
        );
    }

    private async blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to convert blob to data URL"));
            reader.readAsDataURL(blob);
        });
    }
}
