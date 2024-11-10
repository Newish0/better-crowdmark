import { toPng } from "html-to-image";
import { ResourceInliner } from "@/lib/resource-inliner-service";

type ToImageOptions = Parameters<typeof toPng>[1];

/**
 * Configuration options for HTML to PNG conversion.
 */
export interface HtmlToPngOptions {
    /** Width of the output image in pixels */
    width?: number;
    /** Height of the output image in pixels */
    height?: number;
    /** Device pixel ratio for the output image. Higher values produce sharper images but increase file size */
    pixelRatio?: number;
    /** Quality of the output image (0 to 1). Higher values produce better quality but increase file size */
    quality?: number;
    /** Maximum time in milliseconds to wait for resources to load */
    loadTimeout?: number;
    /** Whether to allow JavaScript execution in the rendered content */
    allowScripts?: boolean;
    /** Whether to allow loading resources from origins other than the current one */
    allowSameOriginSources?: boolean;
    /** Additional options to pass to html-to-image's toPng function */
    imageOptions?: Omit<ToImageOptions, "quality" | "pixelRatio">;

    /** Background color of the output image */
    backgroundColor?: string;

    inlineResources?: boolean;
}

/**
 * Converts HTML content to a PNG data URL using a sandboxed iframe for security.
 *
 * @param htmlContent - The HTML string to convert to PNG
 * @param options - Configuration options for the conversion
 * @returns Promise that resolves with the PNG data URL
 *
 * @example
 * ```typescript
 * // Basic usage
 * const dataUrl = await htmlToPngDataUrl('<div>Hello World</div>', {
 *   width: 800,
 *   height: 600
 * });
 *
 * // High security usage
 * const secureDataUrl = await htmlToPngDataUrl(html, {
 *   width: 800,
 *   height: 600,
 *   allowScripts: false,
 *   allowSameOriginSources: false
 * });
 *
 * // High quality usage with custom filter
 * const highQualityDataUrl = await htmlToPngDataUrl(html, {
 *   pixelRatio: 2,
 *   quality: 1.0,
 *   loadTimeout: 10000,
 *   imageOptions: {
 *     filter: (node) => node.tagName !== 'i'
 *   }
 * });
 * ```
 *
 * @throws {Error} If iframe creation fails
 * @throws {Error} If resource loading times out
 * @throws {Error} If PNG conversion fails
 */
export async function htmlToPngDataUrl(
    htmlContent: string,
    options: HtmlToPngOptions = {
        backgroundColor: "white",
        inlineResources: true,
    }
): Promise<string> {
    const inliner = new ResourceInliner({
        baseUrl: "",
        maxSize: 100 * 1024 * 1024, // 100MB,
    });

    const inlinePromise =
        options.inlineResources &&
        inliner.inline(htmlContent).then((html) => {
            htmlContent = html;
        });

    // Create a sandboxed iframe
    const iframe = document.createElement("iframe");

    // Set sandbox attributes based on options
    const sandboxAttributes: string[] = [
        "allow-same-origin", // Needed for html-to-image to work
    ];

    if (options.allowScripts) {
        sandboxAttributes.push("allow-scripts");
    }

    iframe.setAttribute("sandbox", sandboxAttributes.join(" "));

    // Set security headers through CSP
    const cspDirectives = [
        "default-src 'none'",
        "img-src 'self' data: blob:", // Allow only same-origin images and data URLs
        "style-src 'unsafe-inline'", // Allow inline styles for rendering
        "font-src 'self' data:", // Allow same-origin fonts and data URLs
    ];

    if (options.allowSameOriginSources) {
        cspDirectives[1] = "img-src 'self' data: blob: *"; // Allow external images if specified
    }

    // Wait for resources to be inlined
    await inlinePromise;

    // Create HTML content with security headers
    const secureHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Security-Policy" content="${cspDirectives.join("; ")}">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

    try {
        // Set up iframe dimensions
        iframe.style.width = options.width ? `${options.width}px` : "1024px";
        iframe.style.height = options.height ? `${options.height}px` : "768px";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.style.top = "-9999px";

        // Create a promise that resolves when the iframe is loaded
        const iframeLoadPromise = new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error("Iframe loading timed out"));
            }, options.loadTimeout || 5000);

            iframe.onload = () => {
                clearTimeout(timeoutId);
                resolve();
            };

            iframe.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error("Failed to load iframe"));
            };
        });

        // Append iframe to document
        document.body.appendChild(iframe);

        // Write content to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            throw new Error("Could not access iframe document");
        }

        iframeDoc.open();
        iframeDoc.write(secureHtml);
        iframeDoc.close();

        // Wait for iframe to load
        await iframeLoadPromise;

        // Wait for all resources to load within the iframe
        const iframeBody = iframeDoc.body;

        // Convert to PNG using html-to-image options
        const toPngOptions: ToImageOptions = {
            ...options.imageOptions,
            quality: options.quality || 1.0,
            pixelRatio: options.pixelRatio || window.devicePixelRatio,
            cacheBust: true,
            backgroundColor: options.backgroundColor,
        };

        const dataUrl = await toPng(iframeBody, toPngOptions);

        return dataUrl;
    } catch (error) {
        throw new Error(
            `Failed to convert HTML to PNG: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    } finally {
        // Cleanup
        if (iframe.parentNode && !import.meta.env.DEV) {
            iframe.parentNode.removeChild(iframe);
        }
    }
}
