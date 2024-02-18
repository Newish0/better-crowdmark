/**
 * `parser/index.ts`
 *
 * This file is the main parser that distribute work
 * to the smaller parsers, literally an index. This file
 * and everything in this directory should only be used
 * by the offscreen page or options page.
 */

import { getExtension } from "@src/utils/fs";
import { Parser } from "./types";

import markdownParser from "./formats/markdown";
import textParser from "./formats/txt";
import codeParser from "./formats/code";

/** Maps extension to the parser */
const extToParserMap = new Map<string, Parser>();

(function init() {
    function registerParser(p: Parser) {
        const ret = p();
        ret.extensions.forEach((ext) => extToParserMap.set(ext, p));
    }

    // Register individual parsers
    registerParser(markdownParser);
    registerParser(textParser);
    registerParser(codeParser);
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
