import { useEffect } from "react";

export default function () {
    useEffect(() => {
        console.log("Hello from the popup!");
    }, []);

    return (
        <div>
            <img src="/icon-with-shadow.svg" />
            <h1>vite-plugin-web-extension!!</h1>
            <p className="text-2xl bg-red-500">
                Template: <code>react-ts</code>
            </p>
        </div>
    );
}
