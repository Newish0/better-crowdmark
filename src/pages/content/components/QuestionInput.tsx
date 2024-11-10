import { FileIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Question } from "../QuestionTracker";
import styles from "./QuestionInput.module.css";
import { useSupportedExts } from "@/hooks/converter";
import { transferData } from "@/utils/input";
import { getConverter } from "@/pages/background/converter";
import { deserializeFile, serializeFile } from "@/utils/fileSerializer";

const converter = getConverter();

interface QuestionInputProps {
    question: Question;
}

export function QuestionInput({ question }: QuestionInputProps) {
    const [isDragging, setIsDragging] = useState(false);
    const supportedExts = useSupportedExts();

    const handleFiles = async (files: FileList) => {
        console.log("TRANSFER FILES", files, "to", question.fileInput);

        const convertedFiles = (
            await Promise.all(
                Array.from(files).map((f) =>
                    serializeFile(f).then(converter.convert).then(deserializeFile)
                )
            )
        ).filter((f) => !!f);

        if (question.fileInput) transferData(convertedFiles, question.fileInput);
    };

    const handleDrop = (evt: React.DragEvent<HTMLLabelElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer?.files && handleFiles(evt.dataTransfer.files);
    };

    return (
        <label
            className={[styles.inputContainer, isDragging ? styles.dragOver : ""].join(" ")}
            onDrop={handleDrop}
            onDragOver={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
        >
            <input
                className={styles.input}
                type="file"
                onChange={(e) => handleFiles(e.target.files!)}
            />

            <div className={styles.inputContainerContent}>
                <PlusIcon size={48} className={styles.inputContainerPlusIcon} />

                <div className={styles.inputContainerText}>
                    <FileIcon size={32} />
                    {isDragging ? (
                        <div>Release to drop</div>
                    ) : (
                        <div>Drop files here or click to upload files</div>
                    )}
                </div>

                <div className={styles.inputContainerSupportedExts}>
                    Supported formats: {supportedExts.join(", ")}
                </div>
            </div>
        </label>
    );
}
