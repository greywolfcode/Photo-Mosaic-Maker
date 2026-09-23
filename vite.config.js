import { defineConfig } from 'vite'

export default defineConfig(
{
  base: '/Photo-Mosaic-Maker/',
  worker: {
    format: 'iife', 
  }
});