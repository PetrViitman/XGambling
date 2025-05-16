import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import babel from '@rollup/plugin-babel';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  publicDir: 'assets',
  build: {
    outDir: './.builds/full game build',
    target: 'es2015',
    rollupOptions: {
      plugins: [
        babel({
          configFile: './.builds/configs/.babelrc',
          babelHelpers: 'bundled',
          extensions: ['.js'],
          exclude: 'node_modules/**',
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})