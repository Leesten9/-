import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imageCatalog } from './imageCatalog';

export default defineConfig({ plugins: [react(), imageCatalog()] });
