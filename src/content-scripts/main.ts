import ModuleManager, { registerAll as registerAllModules } from "./bc-modules/ModuleManager";
import { debounce } from "@/lib/utils";

/** The target elements Better Crowdmark should run on */
const BC_TARGETS: string[] = [
    ".assignment-question:not(.BC-qroot-modified)", // Crowdmark app input
    ".BC-dev-test-input-container:not(.BC-qroot-modified)", // Development test page input
];

ModuleManager.init();
registerAllModules();

/**
 *
 * @param files {FileList}
 * @returns
 */
const parseFiles = async (files: FileList) => {
    const parsedFiles = Array.from(files).map((f) => ModuleManager.parse(f));
    return await Promise.all(parsedFiles);
};

const transferData = (files: FileList | File[], targetInput: HTMLInputElement) => {
    const dataContainer = new DataTransfer();
    for (const f of files) dataContainer.items.add(f);
    targetInput.files = dataContainer.files;
    const changeEvt = new Event("change");
    targetInput.dispatchEvent(changeEvt);
};

let overlayCleanupFuncs: (() => void)[] = [];
const injectOverlay = () => {
    // Cleanup last rendered overlays
    for (const cleanup of overlayCleanupFuncs) cleanup();
    overlayCleanupFuncs = [];

    // Get list of new zones
    const questionRoots = document.querySelectorAll(BC_TARGETS.join(","));

    // console.log(questionRoots);

    for (const qRoot of questionRoots) {
        // const zone = zoneEln as HTMLElement;
        const fileZone = qRoot.querySelector("label");
        const oriInput: HTMLInputElement | null = qRoot.querySelector("input[type='file']");
        const titleText: HTMLSpanElement | null = qRoot.querySelector(".u-default-text");

        // Skip if page not ready
        if (!fileZone || !oriInput) continue;

        if (titleText)
            titleText.textContent = `Add images, pdf, ${ModuleManager.supportedFormats(
                true,
                false
            ).join(", ")}... files`;

        const overlay = document.createElement("div");
        overlay.classList.add("BC-overlay");

        const bcInput = document.createElement("input");
        bcInput.classList.add("BC-input");
        bcInput.type = "file";
        bcInput.multiple = true;

        // TODO: Lock input while running/parsing
        const handleFiles = async (files: FileList) => {
            const parsedFiles = await parseFiles(files);
            if (oriInput) transferData([...(oriInput.files ?? []), ...parsedFiles], oriInput);
        };

        bcInput.addEventListener("drop", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            evt.dataTransfer?.files && handleFiles(evt.dataTransfer.files);
        });

        bcInput.addEventListener("change", (evt) => {
            const input = evt.target ? (evt.target as HTMLInputElement) : null;
            input?.files && handleFiles(input?.files);
        });

        // TODO: Move styles to CSS
        Object.assign(overlay.style, {
            position: "absolute",
            top: "-5px",
            left: "-5px",
            width: "calc(100% + 10px)",
            height: "calc(100% + 10px)",
        });

        Object.assign(bcInput.style, {
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
        });

        overlay.appendChild(bcInput);

        qRoot.classList.add("BC-qroot-modified");
        fileZone.style.position = "relative";
        fileZone.appendChild(overlay);

        overlayCleanupFuncs.push(() => {
            qRoot.classList.remove("BC-qroot-modified");
            // if (titleText) titleText.textContent = oriTitleText ?? "";
            fileZone.removeChild(overlay);
        });
    }
};

// const debouncedInjectOverlay = debounce(injectOverlay, 500);

// const mutationCallback: MutationCallback = (
//     mutationsList: MutationRecord[],
//     observer: MutationObserver
// ) => {
//     const isMutationFromBCNode = Array.from(mutationsList).some((mutation) => {
//         if (!(mutation.target instanceof HTMLElement)) return;

//         // Check if the mutation is triggered by a node with a class starting with "BC-"
//         const classes = mutation.target.classList;
//         const isMutationFromBCNode = Array.from(classes).some((className) =>
//             className.startsWith("BC-")
//         );

//         return isMutationFromBCNode;
//     });

//     if (!isMutationFromBCNode) {
//         console.log("Mutation observed:");
//         debouncedInjectOverlay();
//     }
// };

const observer = new MutationObserver(debounce(injectOverlay, 500));

observer.observe(document.body, {
    subtree: true,
    childList: true,
});
