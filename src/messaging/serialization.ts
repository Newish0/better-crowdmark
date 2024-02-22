import { SerializedFile } from "./types";

function fileToBase64(file: File) {
    return new Promise<string | undefined>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}

export async function serializeFile(file: File): Promise<SerializedFile> {
    try {
        const dataUrl = (await fileToBase64(file)) ?? "";
        return {
            dataUrl,
            filename: file.name,
            type: file.type,
        };
    } catch (error) {
        return {
            dataUrl: null,
            filename: null,
            type: null,
            error: "Error creating data URL: " + error,
        };
    }
}

export async function deserializeFile(serializedData: SerializedFile): Promise<File | null> {
    if (serializedData.error) {
        console.error("Deserialization error:", serializedData.error);
        return null;
    }

    if (!serializedData.dataUrl || !serializedData.filename) {
        console.error("Deserialization error: Missing required data.");
        return null;
    }

    try {
        const blob = await fetch(serializedData.dataUrl).then((response) => response.blob());
        return new File([blob], serializedData.filename, {
            type: serializedData.type ?? undefined,
        });
    } catch (error) {
        console.error("Error fetching data URL:", error);
        return null;
    }
}
