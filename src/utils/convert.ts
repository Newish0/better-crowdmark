export const dataURLToBlob = async (dataURL: string) => {
    return await (await fetch(dataURL)).blob();
};
