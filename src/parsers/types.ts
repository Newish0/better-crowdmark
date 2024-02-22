export type ParsedFile = File & { name: `${string}.png` };

/**
 * A function that parses a file to a PNG image
 */
export type ParseFunction = (file: File, settings?: any) => ParsedFile | Promise<ParsedFile>;

type SettingsSchema = {
    // TODO
};

type Author = {
    name: string;
    github: `github.com/${string}`;
};

export type ParserInfo = {
    /** Name of the module (i.e. My Module Name)*/
    name: string;

    /** Slug in kebab case (i.e. my-module-slug) */
    slug: string;

    /** Short description of what your module does. */
    description?: string;

    authors?: Author[];

    /** List of file extensions this module supports (i.e. ".cpp", ".java") */
    extensions: `.${string}`[];

    settingsSchema?: SettingsSchema;
};

export type Parser = () => ParserInfo & {
    parse: ParseFunction;
};
