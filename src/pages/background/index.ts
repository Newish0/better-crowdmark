import { registerConverter } from "./converter/index";
import { OffscreenService } from "./offscreen-service";

registerConverter();

chrome.runtime.onInstalled.addListener(() => {
    OffscreenService.getInstance()
        .testOffscreen()
        .then(() => {
            /* empty */
        })
        .catch((error) => {
            console.error("Error testing offscreen:", error);
        });
});
