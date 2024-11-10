import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { $questions } from "../stores/questions";
import { Question } from "../QuestionTracker";
import styles from "./QuestionTOC.module.css";
import { List, ChevronRight } from "lucide-react";

const QuestionTOC: React.FC = () => {
    const questions = useStore($questions);
    const [isHovered, setIsHovered] = useState(false);

    if (questions.length === 0) return null;

    const handleQuestionClick = (question: Question) => {
        const element = question.element as HTMLElement;
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div
            className={styles.container}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className={styles.icon}>
                <List size={24} />
            </span>
            <ul className={`${styles.list} ${isHovered ? styles.listVisible : ""}`}>
                {questions.map((question) => (
                    <li
                        key={question.label}
                        onClick={() => handleQuestionClick(question)}
                        className={styles.listItem}
                    >
                        <ChevronRight size={16} />
                        {question.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestionTOC;
