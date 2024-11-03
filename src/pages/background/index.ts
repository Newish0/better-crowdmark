import { registerConverter } from "./converter/index";
import { OffscreenService } from "./offscreen-service";

registerConverter();

chrome.runtime.onInstalled.addListener(async () => {
    try {
        const offscreenService = await OffscreenService.getInstance();
        await offscreenService.testOffscreen();
    } catch (error) {
        console.error("Error testing offscreen:", error);
    }
});
