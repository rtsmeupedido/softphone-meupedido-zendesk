import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import injectZafHtmlPluginModule from "@app/zendesk/vite-plugin-inject-zaf-html";
import { resolve } from "path";
const { injectZafHtmlPlugin } = injectZafHtmlPluginModule;
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), injectZafHtmlPlugin()],
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
            },
        },
    },
});
