import bgController from "@src/messaging/bgController";

console.log("background script loaded");

bgController(chrome.runtime);
