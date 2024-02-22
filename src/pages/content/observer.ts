import { fileToImage, getSupportedFormats } from "@src/messaging/requestUtils";
import { onElementRemoved } from "@src/utils/mutation";
import { debounce } from "@src/utils/timing";

const BC_TARGETS: string[] = [
    ".assignment-question:not(.BC-qroot-modified)", // Crowdmark app input
    ".BC-dev-test-input-container:not(.BC-qroot-modified)", // Development test page input
];

/**
 *
 * @param files {FileList}
 * @returns
 */
const parseFiles = async (files: FileList) => {
    const parsedFiles = await Promise.all(Array.from(files).map((f) => fileToImage(f)));

    if (parsedFiles.some((f) => !f)) {
        throw new Error("Parse failed");
    }

    return parsedFiles as File[];
};

const transferData = (files: FileList | File[], targetInput: HTMLInputElement) => {
    const dataContainer = new DataTransfer();
    for (const f of files) dataContainer.items.add(f);
    targetInput.files = dataContainer.files;
    const changeEvt = new Event("change");
    targetInput.dispatchEvent(changeEvt);
};

const injectOverlay = () => {
    // Get list of new zones
    const questionRoots = document.querySelectorAll(BC_TARGETS.join(","));

    for (const qRoot of questionRoots) {
        const fileZone = qRoot.querySelector("label");
        const oriInput: HTMLInputElement | null = qRoot.querySelector("input[type='file']");
        const titleText: HTMLSpanElement | null = qRoot.querySelector(".u-default-text");

        // Skip if page not ready
        if (!fileZone || !oriInput) continue;

        if (titleText) {
            getSupportedFormats().then((supportedFormats: string[]) => {
                titleText.textContent = `Add images, pdf, ${supportedFormats.join(", ")}... files`;
            });
        }

        const overlay = document.createElement("div");
        overlay.classList.add("BC-overlay");

        const bcInput = document.createElement("input");
        bcInput.classList.add("BC-input");
        bcInput.type = "file";
        bcInput.multiple = true;

        // TODO: Lock input while running/parsing
        const handleFiles = async (files: FileList) => {
            overlay.classList.remove("BC-overlay-error");
            overlay.classList.add("BC-overlay-busy");
            bcInput.disabled = true;
            try {
                const parsedFiles = await parseFiles(files);
                if (oriInput) transferData([...(oriInput.files ?? []), ...parsedFiles], oriInput);
            } catch (error) {
                overlay.classList.add("BC-overlay-error");
                console.error(error);
            }
            bcInput.disabled = false;
            overlay.classList.remove("BC-overlay-busy");
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

        overlay.appendChild(bcInput);

        qRoot.classList.add("BC-qroot-modified");
        fileZone.style.position = "relative";
        fileZone.appendChild(overlay);

        const cleanup = () => {
            qRoot.classList.remove("BC-qroot-modified");
            overlay.remove();
        };

        onElementRemoved(oriInput, () => {
            console.log("ELEMENT DESTROYED!");
            cleanup();
        });
    }
};

const observer = new MutationObserver(debounce(injectOverlay, 500));

const observe = () => {
    observer.observe(document.body, {
        subtree: true,
        childList: true,
    });
};

export default observe;
