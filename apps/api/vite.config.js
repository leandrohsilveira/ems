import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
    clearScreen: false,
    server: {
        port: 3000
    },
    plugins: [
        VitePluginNode({
            adapter: 'fastify',
            appPath: './src/index.js',
            exportName: 'app',
            tsCompiler: 'esbuild',
            initAppOnBoot: true,
            outputFormat: 'esm'
        })
    ],
    build: {
        ssr: true,
        target: 'es2022',
        outDir: 'dist',
        minify: true
    }
})
