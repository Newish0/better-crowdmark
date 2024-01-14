import {
    dataURLToBlob,
    getExtension,
    imageFromHTML,
    markdownToImg,
    removeExtension,
} from "./utils";

// TODO: Need to move this to background script
const txtToImg = async (txtStr: string) => {};

const parseMarkdownFile = async (markdownFile: File) => {
    const mdImgBlob = await markdownToImg(await markdownFile.text());
    return new File([mdImgBlob], `${removeExtension(markdownFile.name)}.md`);
};

const parseTextFile = (textFile: File) => {
    // Implement the logic to parse text file
    console.log("Parsing text file:", textFile.name);
    // Add the parsed content or any other relevant data to parsedFiles array

    return textFile;
};

/**
 *
 * @param files {FileList}
 * @returns
 */
const parseFiles = async (files: FileList) => {
    const parsedFiles = Array.from(files).map(async (f) => {
        switch (getExtension(f.name)) {
            case ".jpeg":
            case ".jpg":
            case ".png":
            case ".gif":
            case ".webp":
            case ".pdf":
                return f;
            case ".md":
                return parseMarkdownFile(f);
            case ".txt":
                return parseTextFile(f);
            default:
                throw new Error("Unsupported file");
        }
    });

    return await Promise.all(parsedFiles);
};

const transferData = (files: FileList | File[], targetInput: HTMLInputElement) => {
    const dataContainer = new DataTransfer();
    for (const f of files) dataContainer.items.add(f);
    targetInput.files = dataContainer.files;
    const changeEvt = new Event("change");

    // TMP REMOVED
    // targetInput.dispatchEvent(changeEvt);
};

const injectOverlay = () => {
    // Get list of new zones
    const submitZones = document.querySelectorAll(
        "label.assigned-submit__upload-clickzone:not(.BT-zone-modified)"
    );
    console.log(submitZones);

    submitZones.forEach((zoneEln) => {
        // const zone = zoneEln as HTMLElement;
        const zone = zoneEln as HTMLLabelElement;
        zone.classList.add("BT-zone-modified");

        const oriInput: HTMLInputElement | null = zone.querySelector("input[type='file']");

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
            top: "-1rem",
            left: "-1rem",
            width: "calc(100% + 2rem)",
            height: "calc(100% + 2rem)",
        });

        Object.assign(bcInput.style, {
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.5,
        });

        overlay.appendChild(bcInput);

        zone.style.position = "relative";
        zone.appendChild(overlay);
    });
};

const observer = new MutationObserver(injectOverlay);

observer.observe(document.body, { subtree: true, childList: true });
