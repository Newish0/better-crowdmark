export type ParsedFile = File & { name: `${string}.png` };

/**
 * A function that parses a file to a PNG image
 */
export type ParseFunction = (file: File) => ParsedFile | Promise<ParsedFile>;

type Author = {
    name: string;
    github: `github.com/${string}`;
};

export type BCModuleInfo = {
    /** Name of the module (i.e. My Module Name)*/
    name: string;

    /** Slug in kebab case (i.e. my-module-slug) */
    slug: string;

    /** Short description of what your module does. */
    description?: string;

    authors?: Author[];

    /** List of file extensions this module supports (i.e. ".cpp", ".java") */
    extensions: `.${string}`[];
};

export type BCModule = () => BCModuleInfo & {
    parse: ParseFunction;
};
