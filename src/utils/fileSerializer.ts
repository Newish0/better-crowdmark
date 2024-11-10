// fileSerializer.ts

export type SerializedFile = {
    dataUrl: string | null;
    filename: string | null;
    type: string | null;
    error?: string | null;
};

/**
 * Serializes a File object to a serializable format
 * @param file File object to serialize
 * @returns Promise that resolves to SerializedFile object
 */
export const serializeFile = async (file: File): Promise<SerializedFile> => {
    try {
        // Create FileReader instance
        const reader = new FileReader();

        // Convert file to base64 data URL
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                resolve({
                    dataUrl: reader.result as string,
                    filename: file.name,
                    type: file.type,
                    error: null,
                });
            };

            reader.onerror = () => {
                reject({
                    dataUrl: null,
                    filename: null,
                    type: null,
                    error: "Failed to read file",
                });
            };

            reader.readAsDataURL(file);
        });
    } catch (error) {
        return {
            dataUrl: null,
            filename: null,
            type: null,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
};

/**
 * Deserializes a SerializedFile object back to a File object
 * @param serializedFile SerializedFile object to deserialize
 * @returns File object or null if deserialization fails
 */
export const deserializeFile = async (serializedFile: SerializedFile): Promise<File> => {
    try {
        if (!serializedFile.dataUrl || !serializedFile.filename) {
            throw new Error("Invalid serialized file data");
        }

        // Convert base64 to blob
        const response = await fetch(serializedFile.dataUrl);
        const blob = await response.blob();

        // Create new File object
        return new File([blob], serializedFile.filename, {
            type: serializedFile.type || "application/octet-stream",
        });
    } catch (error) {
        throw new Error("Failed to deserialize file: " + error);
    }
};

/**
 * Usage example:
 *
 * // Serializing
 * const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
 * const serialized = await serializeFile(file);
 *
 * // Deserializing
 * const deserialized = await deserializeFile(serialized);
 */
