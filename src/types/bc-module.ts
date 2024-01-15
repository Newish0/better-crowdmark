export type ParsedFile = File & { name: `${string}.png` };

/**
 * A function that parses a file to a PNG image
 */
export type ParseFunction = (file: File) => ParsedFile | Promise<ParsedFile>;

export type BCModule = () => {
    /** Name of the module */
    name: string;

    description?: string;

    /** List of file extensions this module supports (i.e. ".cpp", ".java") */
    extensions: `.${string}`[];

    parse: ParseFunction;
};
