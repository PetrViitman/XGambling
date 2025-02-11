import { defineConfig } from 'vite'
import fs from 'fs'
import vue from '@vitejs/plugin-vue'

const path = require('path')

export default defineConfig({
    publicDir: 'assets',
    plugins: [
        vue(),
    ],
    server: {
        port: 50_000,
    }
})

