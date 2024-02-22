import observe from "./observer";

observe();

// import { createRoot } from "react-dom/client";
// import "./style.css";
// import { fileToImage } from "@src/messaging/requestUtils";
// const div = document.createElement("div");
// div.id = "__root";
// document.body.appendChild(div);

// const rootContainer = document.querySelector("#__root");
// if (!rootContainer) throw new Error("Can't find Options root element");
// const root = createRoot(rootContainer);
// root.render(
//     <div className="absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50">
//         content script loaded
//         <button onClick={() => fileToImage(new File([new Uint8Array([0, 2, 3])], "test"))}>
//             test
//         </button>
//     </div>
// );

try {
    console.debug("[content script] better-crowdmark loaded");
} catch (e) {
    console.error(e);
}
