/** Question element with its label and optional file input */
export type Question = {
    label: string;
    element: Element;
    fileInput?: HTMLInputElement;
};

type Subscriber = (questions: Question[]) => void;

function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
            timeout = null;
        }, wait);
    };
}

/** Tracks question elements in the DOM and notifies subscribers of changes */
export class QuestionTracker {
    private questions: Question[] = [];
    private observer: MutationObserver;
    private readonly questionSelectors: string;
    private readonly inputSelectors: string;

    private subscribers: Set<Subscriber> = new Set();
    private isPaused = false;

    /** @param questionSelectors - CSS selectors for question elements */
    constructor(questionSelectors: string, inputSelectors: string) {
        this.questionSelectors = questionSelectors;
        this.inputSelectors = inputSelectors;
        this.observer = new MutationObserver(debounce(this.handleDomChanges.bind(this), 100));
        this.isPaused = false;
        this.startObserving();
        this.updateQuestions();
    }

    /** Subscribe to question changes
     * @returns Unsubscribe function
     */
    public subscribe(callback: Subscriber): () => void {
        this.subscribers.add(callback);
        callback([...this.questions]);
        return () => this.unsubscribe(callback);
    }

    /** Unsubscribe from question changes */
    public unsubscribe(callback: Subscriber): void {
        this.subscribers.delete(callback);
    }

    public pause(): void {
        this.isPaused = true;
        this.observer.disconnect();
    }

    public resume(): void {
        this.isPaused = false;
        this.startObserving();
    }

    private notifySubscribers(): void {
        const questionsCopy = [...this.questions];
        this.subscribers.forEach((subscriber) => {
            try {
                if (this.isPaused) return;
                subscriber(questionsCopy);
            } catch (error) {
                console.error("Error in question tracker subscriber:", error);
            }
        });
    }

    private startObserving(): void {
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });
    }

    private handleDomChanges(): void {
        this.updateQuestions();
    }

    private extractLabel(element: Element): string {
        const header = element.querySelector("h3");
        if (header) {
            const headerClone = header.cloneNode(true) as Element;
            const small = headerClone.querySelector("small");
            if (small) {
                small.remove();
            }
            return headerClone.textContent?.trim() || "";
        }

        const firstP = element.querySelector("p");
        if (firstP) {
            return firstP.textContent?.trim() || "";
        }

        return "";
    }

    private findFileInput(element: Element): HTMLInputElement | undefined {
        const input = element.querySelector(this.inputSelectors);
        return (input as HTMLInputElement) || undefined;
    }

    private updateQuestions(): void {
        const currentElements = Array.from(document.querySelectorAll(this.questionSelectors));

        const newQuestions = currentElements.map((element) => ({
            label: this.extractLabel(element),
            element,
            fileInput: this.findFileInput(element),
        }));

        const hasChanged = this.hasQuestionsChanged(newQuestions);

        if (hasChanged) {
            this.questions = newQuestions;
            this.notifySubscribers();
        }
    }

    private hasQuestionsChanged(newQuestions: Question[]): boolean {
        if (this.questions.length !== newQuestions.length) {
            return true;
        }

        return newQuestions.some((newQ, index) => {
            const oldQ = this.questions[index];
            return (
                newQ.label !== oldQ.label ||
                newQ.element !== oldQ.element ||
                newQ.fileInput !== oldQ.fileInput
            );
        });
    }

    /** Get current questions */
    public getQuestions(): Question[] {
        return [...this.questions];
    }

    /** Clean up subscriptions and stop tracking */
    public destroy(): void {
        this.observer.disconnect();
        this.subscribers.clear();
    }
}
