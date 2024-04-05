import observe from "./observer";

import { createRoot } from "react-dom/client";
import QuestionToc from "./components/QuestionToc";
import PasteModal from "./components/PasteModal";

observe();

const questionTocRoot = document.createElement("div");
questionTocRoot.id = "__q-toc-root";
document.body.appendChild(questionTocRoot);

const pasteModalRoot = document.createElement("div");
pasteModalRoot.id = "__q-paste-modal-root";
document.body.appendChild(pasteModalRoot);

const questionRootContainer = document.querySelector("#__q-toc-root");
if (!questionRootContainer) throw new Error("Can't find Question TOC root element");
const questionReactRoot = createRoot(questionRootContainer);
questionReactRoot.render(<QuestionToc />);

const pasteModalRootContainer = document.querySelector("#__q-paste-modal-root");
if (!pasteModalRootContainer) throw new Error("Can't find Paste Modal root element");
const pasteModalReactRoot = createRoot(pasteModalRootContainer);
pasteModalReactRoot.render(<PasteModal />);

try {
    console.debug("[content script] better-crowdmark loaded");
} catch (e) {
    console.error(e);
}
