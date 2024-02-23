/**
 * `parser/index.ts`
 *
 * This file is the main parser that distribute work
 * to the smaller parsers, literally an index. This file
 * and everything in this directory should only be used
 * by the offscreen page or options page.
 */

import { getExtension } from "@src/utils/fs";
import { Parser, ParserInfo } from "./types";

import markdownParser from "./formats/markdown";
import textParser from "./formats/txt";
import codeParser from "./formats/code";
import svgParser from "./formats/svg";

/** Maps extension to the parser */
const extToParserMap = new Map<string, Parser>();

/** Map parser slug to its info - all registered parsers */
const registeredParsers = new Map<string, ParserInfo>();

(function init() {
    function registerParser(p: Parser) {
        const ret = p();

        // Disallow re-registration
        if (registeredParsers.has(ret.slug)) return;

        registeredParsers.set(ret.slug, ret);
        ret.extensions.forEach((ext) => extToParserMap.set(ext, p));
    }

    // Register individual parsers
    registerParser(markdownParser);
    registerParser(textParser);
    registerParser(codeParser);
    registerParser(svgParser);
})();

export async function parse(file: File) {
    const ext = getExtension(file.name);
    const parser = extToParserMap.get(ext);

    if (!parser) return null;
    return await parser().parse(file);
}

export function isSupported(extension: string) {
    return extToParserMap.has(extension);
}

export function supportedFormats() {
    return extToParserMap.keys();
}

/**
 * List of registered parsers in lexicographic order (by slug)
 * @returns
 */
export function getParseInfoList() {
    return Array.from(registeredParsers.values()).toSorted((a, b) => a.slug.localeCompare(b.slug));
}
