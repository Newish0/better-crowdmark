import { createRoot } from "react-dom/client";
import { PasteModal } from "./components/PasteModel";
import { QuestionInput } from "./components/QuestionInput";
import { createOverlayRoot } from "./overlay";
import { QuestionTracker } from "./QuestionTracker";
import QuestionTOC from "./components/QuestionTOC";
import { $questions } from "./stores/questions";
import { createIsolatedElement } from "@webext-core/isolated-element";

const questionTracker = new QuestionTracker(
    ".assigned-submit__question, .score-view__assigned-question", // FIXME: sort of need more investigation: .assignment-question includes .assigned-submit__question
    "input[type='file']:not(.bc-root input)"
);

const questionRoots: ReturnType<typeof createOverlayRoot>[] = [];

questionTracker.subscribe((questions) => {
    $questions.set(questions);

    questionTracker.pause();

    for (const root of questionRoots) {
        root.unmount();
    }

    for (const question of questions) {
        if (!question.fileInput) continue;

        const overlaidElement = question.fileInput?.labels?.[0];
        if (!overlaidElement) continue;

        const root = createOverlayRoot(overlaidElement);
        root.render(<QuestionInput question={question} />);
        overlaidElement.style.opacity = "0";
        overlaidElement.style.pointerEvents = "none";

        // Apply fix for drop zone to allow our glow effect to be visible
        const dropZoneTile: HTMLElement | null = question.element.querySelector(".drop-zone-tile");
        if (dropZoneTile) dropZoneTile.style.overflow = "visible";

        questionRoots.push(root);
    }

    console.log("questions", questions);

    questionTracker.resume();
});

const modalRootEln = document.createElement("div");
modalRootEln.id = "modal-root";
document.body.appendChild(modalRootEln);
const modalRoot = createRoot(modalRootEln);
modalRoot.render(<PasteModal />);

// Create question TOC
const tocRootEln = document.createElement("div");
tocRootEln.id = "toc-root";
document.body.appendChild(tocRootEln);
const tocRoot = createRoot(tocRootEln);
tocRoot.render(<QuestionTOC />);

// const { parentElement, isolatedElement } = await createIsolatedElement({
//     name: "modal-root",
//     // css: {
//     //     url: chrome.runtime.getURL(indexCss),
//     // },
//     css: {
//         url: import("./index.css?url")
//     }
//     isolateEvents: true, // or array of event names to isolate, e.g., ['click', 'keydown']
// });
// // document.body.appendChild(parentElement);

// // const modalRoot = createRoot(isolatedElement);
// // modalRoot.render(<PasteModal />);
