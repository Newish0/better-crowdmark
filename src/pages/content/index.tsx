import { createRoot } from "react-dom/client";
import { PasteModal } from "./components/PasteModel";
import { QuestionInput } from "./components/QuestionInput";
import { createOverlayRoot } from "./overlay";
import { QuestionTracker } from "./QuestionTracker";
import { $questions } from "./stores/questions";

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
