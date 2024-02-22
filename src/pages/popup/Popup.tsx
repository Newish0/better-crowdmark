import React from "react";
import { IconSettings, IconInfoSquare } from "@tabler/icons-react";

export default function Popup(): JSX.Element {
    const manifest = chrome.runtime.getManifest();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <img src="/icon/icon-with-shadow.svg" className="w-full m-auto" />

                    <h1 className="text-3xl font-bold">{manifest.name}</h1>
                    <p>version {manifest.version}</p>
                    <p className="py-6 neutral-content">{manifest.description}</p>

                    <ul className="menu bg-base-200 w-full">
                        <li>
                            <a href="/src/pages/options/index.html#settings" target="_blank">
                                <IconSettings />
                                Settings
                            </a>
                        </li>
                        <li>
                            <a href="/src/pages/options/index.html#about" target="_blank">
                                <IconInfoSquare />
                                About
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
