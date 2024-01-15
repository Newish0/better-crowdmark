import ModuleManager from "./bc-modules/ModuleManager";
import markdownModule from "./bc-modules/markdown";
import textModule from "./bc-modules/txt";

/** The target elements Better Crowdmark should run on */
const BC_TARGETS: string[] = [
    "label.assigned-submit__upload-clickzone:not(.BT-zone-modified)", // Crowdmark app input
    ".BT-dev-test-input-container:not(.BT-zone-modified)", // Development test page input
];

ModuleManager.init();
ModuleManager.load(markdownModule);
ModuleManager.load(textModule);

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
    const submitZones = document.querySelectorAll(BC_TARGETS.join(","));
    console.log(submitZones);

    submitZones.forEach((zoneEln) => {
        // const zone = zoneEln as HTMLElement;
        const zone = zoneEln as HTMLLabelElement;
        zone.classList.add("BT-zone-modified");

        const oriInput: HTMLInputElement | null = zone.querySelector("input[type='file']");
        const titleText: HTMLSpanElement | null = zone.querySelector(".u-default-text");

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
            console.log("HANDLE FILES", files);
            const parsedFiles = await parseFiles(files);
            console.log("PARSED FILES", parsedFiles);
            if (oriInput) transferData([...(oriInput.files ?? []), ...parsedFiles], oriInput);
        };

        bcInput.addEventListener("drop", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            console.log("FILE DROP");
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

        zone.style.position = "relative";
        zone.appendChild(overlay);
    });
};

const observer = new MutationObserver(injectOverlay);

observer.observe(document.body, { subtree: true, childList: true });
