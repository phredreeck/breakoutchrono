import { fileURLToPath, URL } from 'node:url';
import path from 'path'

import { defineConfig, normalizePath } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    base: "/breakout/",
    define: {
        "APP_MODE": JSON.stringify(process.env.NODE_ENV),
        "APP_PLATFORM": JSON.stringify("webapp"),
    },
    build: {
        assetsInlineLimit: 65536
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                id: "ovh.feret.breakoutchrono",
                name: 'Breakout Chrono',
                short_name: 'Breakout Chrono',
                description: 'Another breakout inspired game.',
                categories: ["games"],
                theme_color: '#0000FF',
                background_color: '#0000FF',
                display: 'standalone',
                orientation: "landscape",
                lang: "en",
                icons: [
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                ]
            }
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
        }
    }
})
