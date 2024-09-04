import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        plugins: [
            vue(),
            viteStaticCopy({
                targets: [
                    {
                        src: "src/assets/images/icon.png",
                        dest: "assets/images",
                    },
                ],
            }),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        build: { chunkSizeWarningLimit: 1024 },
        preview: {
            port: parseInt(process.env.VITE_PORT) || 4173,
        },
    });
};
