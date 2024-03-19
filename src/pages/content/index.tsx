import observe from "./observer";


import { createRoot } from "react-dom/client";
import QuestionToc from "./components/QuestionToc";


observe();


const questionTocRoot = document.createElement("div");
questionTocRoot.id = "__q-toc-root";
document.body.appendChild(questionTocRoot);

const rootContainer = document.querySelector("#__q-toc-root");
if (!rootContainer) throw new Error("Can't find Options root element");
const root = createRoot(rootContainer);
root.render(
    <QuestionToc />
);

try {
    console.debug("[content script] better-crowdmark loaded");
} catch (e) {
    console.error(e);
}
