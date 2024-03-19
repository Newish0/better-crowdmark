import { atom } from "nanostores";
import { Question } from "../types";

export const $questions = atom<Question[]>([]);
