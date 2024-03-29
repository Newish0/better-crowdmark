import React, { useState } from "react";
import { IconSettings, IconInfoSquare } from "@tabler/icons-react";
import { getParseInfoList } from "@src/parsers";

export default function Options(): JSX.Element {
    const [parsers] = useState(getParseInfoList());
    const manifest = chrome.runtime.getManifest();

    return (
        <div className="flex flex-row flex-nowrap gap-3 h-dvh overflow-hidden">
            <div className="max-w-96 min-w-80 w-1/4 bg-base-200 overflow-auto">
                <div className="flex items-center justify-start">
                    <img src="/icon/icon-with-shadow.svg" className="w-1/2 m-[-1rem]" />
                    <h1 className="text-4xl font-bold">Settings</h1>
                </div>

                <ul className="menu">
                    <li>
                        <details open>
                            <summary>Modules</summary>
                            <ul>
                                {parsers.map((p) => (
                                    <li key={p.slug}>
                                        <a href={`#module-${p.slug}`}>{p.name}</a>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </li>
                    <li>
                        <a>About</a>
                    </li>
                </ul>
            </div>

            <div className="my-6 space-y-3 overflow-auto">
                <section>
                    <h2 className="text-3xl font-semibold">Modules</h2>
                    <div className="divider"></div>
                    <div className="space-y-4">
                        {parsers.map((p) => (
                            <div key={p.slug} id={`module-${p.slug}`}>
                                <h3 className="text-xl font-medium my-1">
                                    {p.name}
                                    {p.authors?.length ? (
                                        <span className="text-info text-sm mx-2">
                                            by
                                            {p.authors?.map((a) => (
                                                <a
                                                    href={`https://${a.github}`}
                                                    key={a.github}
                                                    className="mx-1"
                                                >
                                                    {a.name}
                                                </a>
                                            ))}
                                        </span>
                                    ) : null}
                                </h3>
                                <div className="bg-base-200 p-4 rounded-box">
                                    <div className="flex gap-2 flex-wrap flex-row">
                                        {p.extensions.map((ext) => (
                                            <span className="badge badge-neutral" key={ext}>
                                                {ext}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-base my-2">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-semibold">About</h2>
                    <div className="divider"></div>
                    <div className="flex items-center gap-2 bg-base-200 p-4 rounded-box">
                        <img src="/icon/128.png" className="w-12" />
                        <div>
                            <span className="text-xl font-bold">{manifest.name}</span>
                            <sup className="font-extralight">{manifest.version}</sup>
                            <p className="font-light">{manifest.description}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
