import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import {fileURLToPath} from 'node:url'

export default defineConfig({
    define: {
        'process.env': {}, // 일부 라이브러리가 process 참조 시 에러 방지
        global: 'globalThis',
    },
    resolve: {
        alias: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            buffer: 'buffer/',
            util: 'util/',
            process: 'process/browser',
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        }
    },
    optimizeDeps: {
        include: ['sockjs-client', 'crypto-browserify', 'buffer', 'util', 'process'],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                    process: true,
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
                target: 'http://app:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: 'http://app:8080',
                ws: true,
                changeOrigin: true,
                secure: false
            },
        },
    },
    plugins: [vue(), vueDevTools()]
})
