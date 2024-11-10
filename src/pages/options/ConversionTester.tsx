import { useState } from "react";
import { getConverter } from "@/pages/background/converter";
import { deserializeFile, serializeFile } from "@/utils/fileSerializer";

const converter = getConverter();

export function ConversionTester() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [conversionError, setConversionError] = useState<string | null>(null);

    const handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const file = evt.target.files?.[0];

        if (!file) {
            setFile(null);
            return;
        }

        setIsConverting(true);
        serializeFile(file)
            .then(converter.convert)
            .then(deserializeFile)
            .then((file: File) => {
                setFile(file);
            })
            .catch((err: Error) => {
                setConversionError(err.message);
            })
            .finally(() => setIsConverting(false));
    };

    return (
        <div>
            <input type="file" className="file-input w-full max-w-xs" onChange={handleFileChange} />

            {isConverting && <p>Converting...</p>}
            {conversionError && <p>{conversionError}</p>}

            {file && (
                <div>
                    <div className="divider"></div>
                    <h3 className="font-bold text-lg">File details</h3>
                    <p>Filename: {file.name}</p>
                    <p>Size: {file.size} bytes</p>
                    <p>Type: {file.type}</p>
                    <div className="divider"></div>
                    <div className="mockup-window border-base-300 border w-max">
                        <div className="border-base-300  border-t p-4">
                            <img src={URL.createObjectURL(file)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
