/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { dirs: ['src'] },
  /**
   * Runtime server webpack (webpack-runtime.js) faz require('./<chunkId>.js') relativo a '.next/server'.
   * Entretanto, os chunks estavam sendo emitidos em '.next/server/chunks/'. Ajustamos para emitir
   * diretamente em '.next/server/<id>.js' (chunkFilename='[id].js'), alinhando com o caminho esperado
   * e eliminando o erro "Cannot find module './276.js'".
   */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Emite chunks no diretório raiz do server build.
      config.output = config.output || {};
      config.output.chunkFilename = '[id].js';
    }
    return config;
  }
};

export default nextConfig;
