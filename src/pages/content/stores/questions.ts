import { atom } from "nanostores";
import { Question } from "../QuestionTracker";

export const $questions = atom<Question[]>([]);
