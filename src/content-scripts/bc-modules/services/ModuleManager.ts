import { BCModule, BCModuleInfo, ParseFunction, ParsedFile } from "@/types/bc-module";
import { getExtension } from "./utils";

import markdownModule from "@/content-scripts/bc-modules/modules/markdown";
import textModule from "@/content-scripts/bc-modules/modules/txt";
import hljsModule from "@/content-scripts/bc-modules/modules/hljs";
import svgModule from "@/content-scripts/bc-modules/modules/svg";

export default class ModuleManager {
    private static defaultExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp", ".pdf"];

    private static loadedModules: ReturnType<BCModule>[] = [];
    private static extParseMap = new Map<string, ParseFunction>();

    public static init() {
        for (const ext of ModuleManager.defaultExtensions)
            ModuleManager.extParseMap.set(ext, (file: File) => file as ParsedFile);
    }

    public static load(bcModule: BCModule) {
        const moduleInfo = bcModule();
        console.debug("[Better Crowdmark] Load Module", moduleInfo.name);

        for (const ext of moduleInfo.extensions) {
            if (ModuleManager.extParseMap.has(ext)) {
                throw new Error(
                    `Failed to load module ${moduleInfo.name}. Conflicting extension ${ext}`
                );
            }
            ModuleManager.extParseMap.set(ext, moduleInfo.parse);
        }

        ModuleManager.loadedModules.push(moduleInfo);
    }

    public static loadAll() {
        ModuleManager.load(markdownModule);
        ModuleManager.load(textModule);
        ModuleManager.load(hljsModule);
        ModuleManager.load(svgModule);
    }

    public static parse(file: File) {
        const ext = getExtension(file.name);
        const parseFunc = ModuleManager.extParseMap.get(ext);
        if (!parseFunc) throw new Error("Unsupported file");
        return parseFunc(file);
    }

    public static supportedFormats(ignoreDefaults = true, includeDot = true) {
        let exts = Array.from(ModuleManager.extParseMap.keys());
        return (
            ignoreDefaults
                ? exts.filter((ext) => !ModuleManager.defaultExtensions.includes(ext))
                : exts
        ).map((ext) => (includeDot ? ext : ext.slice(1)));
    }

    public static getLoadedModules(): BCModuleInfo[] {
        return JSON.parse(JSON.stringify(ModuleManager.loadedModules));
    }
}
