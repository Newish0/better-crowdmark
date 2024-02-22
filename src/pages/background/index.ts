import bgController from "@src/messaging/bgController";

console.debug("[background] script loaded");

bgController(chrome.runtime);
