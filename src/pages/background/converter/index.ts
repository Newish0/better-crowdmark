import { deserializeFile, SerializedFile, serializeFile } from "@/utils/fileSerializer";
import { bypassModule } from "./modules/bypass";
import { codeSyntaxHighlightModule } from "./modules/code";
import { Module } from "./modules/index";
import { defineProxyService } from "@webext-core/proxy-service";
import { markdownModule } from "./modules/markdown";

function createConverter(modules: Module[]) {
    return {
        getModuleInfos() {
            return modules.map((m) => ({ ...m, convert: undefined }));
        },
        getSupportedExtensions() {
            return modules.flatMap((m) => m.extensions).sort();
        },
        async convert(serializedFile: SerializedFile): Promise<SerializedFile> {
            const file = await deserializeFile(serializedFile);

            if (!file) {
                throw new Error("Failed to deserialize file");
            }

            const ext = "." + file.name.split(".").pop();
            const module = modules.find((m) => m.extensions.includes(ext as any));
            if (!module) {
                throw new Error(`Unsupported file type: ${ext}`);
            }

            const convertedFile = await module.convert(file);
            return serializeFile(convertedFile);
        },
    };
}

const converter = createConverter([bypassModule, codeSyntaxHighlightModule, markdownModule]);

export const [registerConverter, getConverter] = defineProxyService("Converter", () => converter);
