import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Use 'VITE_' prefix to expose variables to client
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    // Base public path
    base: './',
    
    // Server configuration
    server: {
      port: 3000,
      open: true,
      cors: true,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild', // Use esbuild (faster, built-in)
      rollupOptions: {
        output: {
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth'],
          },
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.').at(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            }
            if (/css/i.test(extType)) {
              extType = 'css';
            }
            return `${extType}/[name]-[hash][extname]`;
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
        },
      },
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth'],
    },
  };
});
