import { IconSettings, IconInfoSquare } from "@tabler/icons-react";
import browser from "webextension-polyfill";

export default function () {
    const manifest = browser.runtime.getManifest();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <img src="/icon-with-shadow.svg" className="w-full m-auto" />

                    <h1 className="text-3xl font-bold">Better Crowdmark</h1>
                    <p>version {manifest.version}</p>
                    <p className="py-6 neutral-content">{manifest.description}</p>

                    <ul className="menu bg-base-200 w-full">
                        <li>
                            <a href="./options.html#settings" target="_blank">
                                <IconSettings />
                                Settings
                            </a>
                        </li>
                        <li>
                            <a href="./options.html#about" target="_blank">
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
