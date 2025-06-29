import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import {fileURLToPath} from 'node:url'

export default defineConfig(({ mode }) => {
    // 환경변수 로드
    const env = loadEnv(mode, process.cwd(), '')
    
    return {
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
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                },
                '/ws': {
                    target: env.VITE_API_BASE_URL,
                    ws: true,
                    changeOrigin: true,
                    secure: false
                },
                '/chatrooms': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                },
                '/api': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                },
                '/oauth2': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                },
                '/logout': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                },
            },
        },
        plugins: [vue(), vueDevTools()]
    }
})
