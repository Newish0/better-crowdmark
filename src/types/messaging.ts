export enum RuntimeMsgAction {
    RenderKatex,
}

export type RenderKatexRequest = {
    action: RuntimeMsgAction.RenderKatex;
    katex: string;
    options?: katex.KatexOptions;
};

export type RenderKatexResponse = string;
