import { defineConfig } from 'vite'

// Preview the compiled H5 bundle without invoking the uni-app compiler.
export default defineConfig({ build: { outDir: 'dist/build/h5' }, preview: { host: '127.0.0.1', port: 4173, strictPort: true } })
