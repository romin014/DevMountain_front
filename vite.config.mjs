import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
                NodeModulesPolyfillPlugin(),
            ],
        },
    },
    build: {
        rollupOptions: {
            plugins: [rollupNodePolyFill()],
        },
    },
    server: {
        proxy: {
            '/users': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
            util: 'rollup-plugin-node-polyfills/polyfills/util',
            process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
        },
    },
})
