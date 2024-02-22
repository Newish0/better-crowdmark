export enum MessageType {
    FileToImage,
    _OffBgFileToImage,
}

export type MessageRequest = {
    type: MessageType;
    data: object;
};

export type FileToImageRequest = MessageRequest & {
    type: MessageType.FileToImage;
    data: SerializedFile;
};

export type _OffBgFileToImageRequest = {
    type: MessageType._OffBgFileToImage;
    data: SerializedFile;
    target: "offscreen";
};

export interface SerializedFile {
    dataUrl: string | null;
    filename: string | null;
    type: string | null;
    error?: string | null;
}
