import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import path from "node:path";
import { fileURLToPath } from "node:url";

function generateManifest() {
    const manifest = readJsonFile("src/manifest.json");
    const pkg = readJsonFile("package.json");
    return {
        name: pkg.displayName,
        description: pkg.description,
        version: pkg.version,
        ...manifest,
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        webExtension({
            manifest: generateManifest,
            additionalInputs: ["src/options.html", "src/options.tsx"],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),

            // In dev mode, make sure fast refresh works
            "/@react-refresh": path.resolve(
                "node_modules/@vitejs/plugin-react-swc/refresh-runtime.js"
            ),
        },
    },
    build: {
        minify: true,
        sourcemap: false,
    },
});
