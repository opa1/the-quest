/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      }
    }
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        '@lucid-evolution/lucid',
        '@lucid-evolution/provider',
        '@anastasia-labs/cardano-multiplatform-lib-nodejs',
      ]
    }
    return config
  },
}

export default nextConfig
