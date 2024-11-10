import { useEffect, useState } from "react";
import { $questions } from "../stores/questions";
import { Modal } from "./Modal";
import { useStore } from "@nanostores/react";
import styles from "./PasteModal.module.css";

import { isBrowserImageFile } from "@/utils/format";
import { FileIcon, FileWarningIcon } from "lucide-react";
import { Question } from "../QuestionTracker";
import { transferData } from "@/utils/input";
import { getConverter } from "@/pages/background/converter";
import { deserializeFile, serializeFile } from "@/utils/fileSerializer";

const converter = getConverter();

export function PasteModal() {
    const [isOpen, setIsOpen] = useState(false);
    const questions = useStore($questions);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const [pastedContent, setPastedContent] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handlePaste = (evt: ClipboardEvent) => {
            resetModalContent();

            const dT: DataTransfer | null = evt.clipboardData || (window as any).clipboardData;
            let file = dT?.files[0];
            const txtData = dT?.getData("text");

            if (txtData) {
                file = new File([txtData], "paste.txt", { type: "text/plain" });
            }

            if (!file) return;

            setIsOpen(true);
            setLoading(true);
            setError(null);

            serializeFile(file)
                .then(converter.convert)
                .then(deserializeFile)
                .then((file: File) => {
                    setPastedContent(file);
                })
                .catch((err: Error) => {
                    setError(err.message);
                })
                .finally(() => setLoading(false));
        };
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, []);

    const resetModalContent = () => {
        setPastedContent(null);
        setError(null);
        setLoading(false);
        setSelectedQuestion(null);
    };

    const handleClose = () => {
        setIsOpen(false);
        resetModalContent();
    };

    const handleInsert = () => {
        if (!selectedQuestion || !pastedContent) return;
        if (selectedQuestion.fileInput) transferData([pastedContent], selectedQuestion.fileInput);
        handleClose();
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <div className={styles.container}>
                <div>
                    {loading ? (
                        "Loading..."
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <FileDisplay file={pastedContent} />
                    )}
                </div>

                <div className={styles.questionsPanel}>
                    <h5>Selection question</h5>
                    <div className={styles.questionsContainer}>
                        {questions.map((question, i) => (
                            <div key={question.label + i}>
                                <label htmlFor={`question-${i}`}>
                                    <input
                                        onChange={() => setSelectedQuestion(question)}
                                        disabled={!pastedContent}
                                        type="radio"
                                        id={`question-${i}`}
                                        name="selection" // Same name for all options to group them
                                        value={question.label} // The value of the radio button
                                    />
                                    {question.label}
                                    {/* The label text is now nested inside the label */}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button disabled={!pastedContent || !selectedQuestion} onClick={handleInsert}>
                        Insert
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className={styles.errorMessage}>
            <FileWarningIcon /> {message}
        </div>
    );
}

function FileDisplay({ file }: { file: File | null }) {
    if (!file) return <ErrorMessage message={"No file detected"} />;

    if (isBrowserImageFile(file)) {
        return (
            <div className={styles.previewContainer}>
                <img src={URL.createObjectURL(file)} />
            </div>
        );
    } else if (file.type === "application/pdf") {
        return (
            <iframe className={styles.previewContainer} src={URL.createObjectURL(file)}></iframe>
        );
    }

    return (
        <div>
            <div>
                <FileIcon />
                <div>{file.name}</div>
            </div>
        </div>
    );
}
