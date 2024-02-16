export enum MessageType {
    FileToImage,
}

export type MessageRequest = {
    type: MessageType;
    data: object;
};
