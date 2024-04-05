import { useStore } from "@nanostores/react";
import { $questions } from "../stores/toc";
import { useEffect, useRef, useState } from "react";
import { Question } from "../types";
import { IconFile } from "@tabler/icons-react";
import { getExtension, isWebImageFile } from "@src/utils/fs";

export default function QuestionToc() {
    const questions = useStore($questions);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const pasteHandler = (evt: ClipboardEvent) => {
            console.log("HANDLED PASTE", evt);

            const dT: DataTransfer | null = evt.clipboardData || (window as any).clipboardData;
            const file = dT?.files[0];
            const txtData = dT?.getData("text");

            if (file) {
                setFile(file);
            } else if (txtData) {
                setFile(new File([txtData], "paste.txt", { type: "text/plain" }));
            }
        };
        document.addEventListener("paste", pasteHandler);

        return () => {
            document.removeEventListener("paste", pasteHandler);
        };
    }, []);

    const handlePasteToQuestion = (question: Question) => {
        if (!question.fileInput || !file) return;
        const dataContainer = new DataTransfer();
        dataContainer.items.add(file);
        question.fileInput.files = dataContainer.files;
        const changeEvt = new Event("change");
        question.fileInput.dispatchEvent(changeEvt);
    };

    const handleClose = () => {
        setFile(null);
    };

    if (!file) return <></>;

    return (
        <div className="BC-paste-modal">
            <div className="BC-paste-modal-content">
                <h3>Where do you want to paste to?</h3>
                <Preview content={file} />
                <hr />
                <ul className="BC-paste-modal-questions">
                    {questions.map((q) => (
                        <li>
                            <a href="javascript:void(0)" onClick={() => handlePasteToQuestion(q)}>
                                {q.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <button onClick={handleClose}>Cancel</button>
            </div>
        </div>
    );
}

const Preview = ({ content }: { content: File | null }) => {
    const [text, setText] = useState("");

    useEffect(() => {
        if (content?.name === "paste.txt") {
            content?.text().then((t) => setText(t));
        }
    }, [content]);

    if (!content) {
        return <></>;
    }

    if (content instanceof File) {
        if (isWebImageFile(content.name)) {
            return <img src={URL.createObjectURL(content)} />;
        }

        if (content.name === "paste.txt") {
            return <pre>{text}</pre>;
        }

        return (
            <div>
                <IconFile />
                {content.name}
            </div>
        );
    }
};
