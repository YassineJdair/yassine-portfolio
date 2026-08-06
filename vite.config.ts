/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
        sitemap({
            hostname: 'https://www.yassinejdair.dev',
            dynamicRoutes: [
                '/projects',
                '/experience',
                '/about',
                '/games',
                '/crossyroad',
                '/pacmangame',
                '/carroadgame',
                '/snake',
                '/dailyword',
                '/zip',
                '/patches',
                '/calculator',
                '/pomodoro-timer',
                '/task-tracker',
                '/temperature-converter',
                '/expense-tracker',
                '/salary-calculator',
                '/car-calculator',
                '/habit-tracker',
                '/password-generator',
                '/json-formatter',
                '/readme-generator',
                '/qr-code-generator',
                '/mortgage-calculator',
            ],
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        environment: "jsdom",
        globals: true,
    },
}));