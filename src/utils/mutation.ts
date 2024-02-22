export function onElementRemoved(element: Element, cb: () => void) {
    const doc = element.ownerDocument;

    const observer = new MutationObserver(() => {
        if (!doc.body.contains(element)) {
            cb();
            observer.disconnect();
        }
    });

    observer.observe(doc, { childList: true, subtree: true });

    // Manual cleanup function
    return () => {
        observer.disconnect();
    };
}
