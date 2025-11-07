import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os';

// Get network interfaces
const networkInterfaces = os.networkInterfaces();
const addresses = [];
for (const interfaceName in networkInterfaces) {
  for (const iface of networkInterfaces[interfaceName]) {
    // Skip internal (non-IPv4) and non-internal (loopback) addresses
    if (iface.family === 'IPv4' && !iface.internal) {
      addresses.push(iface.address);
    }
  }
}

console.log('Network interfaces:', addresses);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/HowDoYouKnowThem/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173
    },
    watch: {
      usePolling: true
    }
  },
  preview: {
    host: true,
    port: 5173
  }
});
