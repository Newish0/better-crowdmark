export type ConvertedFile = File & { type: "image/png" | "image/jpeg" | "application/pdf" };

export type ModuleInfo = {
    name: string;
    slug: string;
    description: string;
    extensions: `.${string}`[];
};

export type Module = ModuleInfo & {
    convert: (file: File) => Promise<ConvertedFile> | ConvertedFile;
};

export function createModule(partialModule: {
    name?: Module["name"];
    slug: Module["slug"];
    description?: Module["description"];
    extensions: Module["extensions"];
    convert: Module["convert"];
}): Module {
    return {
        name: partialModule.slug,
        description: "",
        ...partialModule,
    };
}
