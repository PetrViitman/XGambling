import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import babel from '@rollup/plugin-babel';
import vue from '@vitejs/plugin-vue'
import ViteCssInJs from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    vue(),
    ViteCssInJs()
  ],
  publicDir: false,
  build: {
    target: 'es2015',
    outDir: './.builds/presentation layer build',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    lib: {
      entry: 'src/EntryPointForPresentationLayerBuild.js',
      formats: ['iife'],
      name: 'PresentationLayer',
      fileName: (format) => `CompiledPresentationLayer.js`,
    },
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
  minify: 'terser',
  terserOptions: {
    compress: {
      passes: 3,
      drop_console: true,
      drop_debugger: true,
    },
    mangle: {
      toplevel: true,
    },
    format: {
      comments: false,
    },
  },
});