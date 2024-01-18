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

const injectOverlay = () => {
    // Get list of new zones
    const questionRoots = document.querySelectorAll(BC_TARGETS.join(","));

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

        overlay.appendChild(bcInput);

        qRoot.classList.add("BC-qroot-modified");
        fileZone.style.position = "relative";
        fileZone.appendChild(overlay);

        const cleanup = () => {
            qRoot.classList.remove("BC-qroot-modified");
            overlay.remove();
        };

        const qRootObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target === overlay || overlay.contains(mutation.target)) return;
                cleanup();
                qRootObserver.disconnect();
            });
        });
        qRootObserver.observe(qRoot, {
            subtree: true,
            childList: true,
        });
    }
};

const observer = new MutationObserver(debounce(injectOverlay, 500));

observer.observe(document.body, {
    subtree: true,
    childList: true,
});
