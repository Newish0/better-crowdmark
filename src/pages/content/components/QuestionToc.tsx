import { useStore } from "@nanostores/react";
import { $questions } from "../stores/toc";
import { useEffect, useRef, useState } from "react";
import { IconBookmark } from "@tabler/icons-react";

// import "../tw.css";

export default function QuestionToc() {
    const questions = useStore($questions);

    console.log(questions);

    if (!questions.length) {
        return <></>;
    }

    return (
        <div className={`BC-question-toc-container`}>
            <h5>Questions</h5>
            <ul>
                {questions.map((q) => (
                    <li>
                        <a onClick={() => q.root.scrollIntoView({ behavior: "smooth" })}>
                            {q.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
