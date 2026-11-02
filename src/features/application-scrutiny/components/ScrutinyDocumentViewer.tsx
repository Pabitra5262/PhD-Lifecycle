import { useEffect, useState } from "react";

export const ScrutinyDocumentViewer = ({ file }: { file: File }) => {
    const [url] = useState(() => URL.createObjectURL(file));
    useEffect(() => () => URL.revokeObjectURL(url), [url]);
    return <div className="space-y-3">
        <a className="text-primary underline" href={url} download={file.name}>Download {file.name}</a>
        {file.type === "application/pdf" ? <iframe title={file.name} src={url} className="h-[65vh] w-full" /> : <img src={url} alt={file.name} className="max-h-[65vh] max-w-full" />}
    </div>;
};

