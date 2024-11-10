import { useEffect, useState } from "react";

import { type ModuleInfo } from "@/pages/background/converter/modules/";
import { getConverter } from "@/pages/background/converter";

const converter = getConverter();

export function useSupportedExts() {
    const [supportedExts, setSupportedExts] = useState<string[]>([]);

    useEffect(() => {
        converter.getSupportedExtensions().then(setSupportedExts);
    }, [setSupportedExts]);

    return supportedExts;
}

export function useAllModuleInfo() {
    const [allModuleInfo, setAllModuleInfo] = useState<ModuleInfo[]>([]);

    useEffect(() => {
        converter.getModuleInfos().then(setAllModuleInfo);
    }, [setAllModuleInfo]);

    return allModuleInfo;
}
