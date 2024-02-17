const docObserverMap = new Map<
    Document,
    {
        observer: MutationObserver;
        elnCbPairs: [Element, () => void][];
    }
>();

export function onElementRemoved(element: Element, cb: () => void) {
    const doc = element.ownerDocument;

    if (!docObserverMap.has(doc)) {
        const observer = new MutationObserver(() => {
            const elnCbPairs = docObserverMap.get(doc)?.elnCbPairs;
            if (!elnCbPairs || !elnCbPairs.length) {
                observer.disconnect();
                return;
            }

            for (const pair of elnCbPairs) {
                const [, cb] = pair;
                if (!doc.body.contains(element)) {
                    cb();
                    elnCbPairs.splice(elnCbPairs.indexOf(pair), 1);
                }
            }
        });

        observer.observe(doc, { childList: true, subtree: true });
    }
}
