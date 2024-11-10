import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import manifest from "./manifest.json";
import pkg from "./package.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transformedManifest: ManifestV3Export = {
    ...(manifest as any),
    version: pkg.version,
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), crx({ manifest: transformedManifest })],

    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            port: 5173,
        },
    },

    build: {
        sourcemap: true,

        rollupOptions: {
            input: {
                /* Entry point for offscreen document */
                offscreen: "src/pages/offscreen/index.html",
            },
        },
    },

    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
});
