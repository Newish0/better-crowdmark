import { createRoot, type Root } from "react-dom/client";

export function createOverlayRoot(overlaidElement: HTMLElement): Root {
    // Create container that will hold our React root
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.classList.add("bc-root");

    // Position the container relative to the overlaid element
    const updatePosition = () => {
        const rect = overlaidElement.getBoundingClientRect();
        const parentRect = overlaidElement.offsetParent?.getBoundingClientRect() || {
            left: 0,
            top: 0,
        };

        container.style.left = `${rect.left - parentRect.left}px`;
        container.style.top = `${rect.top - parentRect.top}px`;
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;
        container.style.overflow = "visible";
        container.style.zIndex = "2";
    };

    // Insert the container as a sibling
    overlaidElement.parentElement?.insertBefore(container, overlaidElement.nextSibling);
    updatePosition();

    // Set up position tracking
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(overlaidElement);

    // Create the React root
    const root = createRoot(container);

    // Store the original unmount to clean up our listeners
    const originalUnmount = root.unmount.bind(root);
    root.unmount = () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
        resizeObserver.disconnect();
        container.remove();
        originalUnmount();
    };

    return root;
}

// Usage example:
// const root = createOverlayRoot(someElement);
// root.render(
//     <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'all' }}>
//         My overlay content
//     </div>
// );
//
// // Later when done:
// root.unmount();
