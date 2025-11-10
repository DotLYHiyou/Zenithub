import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from "vite-plugin-static-copy";
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

// https://vite.dev/config/
export default defineConfig({
    base: "",
    plugins: [
        svelte(),
        tailwindcss(),
        viteStaticCopy({
            targets: [
                {
                    src: uvPath + "/*.*js",
                    dest: "uv",
                    overwrite: false, // preserve our custom uv.config.js
                },
                {
                    src: bareModulePath + "/*.*js",
                    dest: "baremod",
                },
                {
                    src: libcurlPath + "/*.*js",
                    dest: "libcurl",
                },
                {
                    src: baremuxPath + "/*.*js",
                    dest: "baremux",
                },
            ]
        }),
    ],
})