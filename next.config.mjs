/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the Cardano libs out of the server bundle. They load the CML `.wasm`
  // binary from disk at runtime, and bundling them rewrites that path to one
  // that doesn't exist (ENOENT on cardano_multiplatform_lib_bg.wasm), which
  // breaks every wallet signature check.
  //
  // This must live here rather than in the `webpack` hook below: `next dev` runs
  // Turbopack, which ignores webpack config entirely, so server externals
  // declared there only ever applied to `next build --webpack`. @lucid-evolution/utils
  // was also missing from that list, so it got bundled even in a webpack build.
  serverExternalPackages: [
    "@lucid-evolution/lucid",
    "@lucid-evolution/provider",
    "@lucid-evolution/utils",
    "@anastasia-labs/cardano-multiplatform-lib-nodejs",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      }
    }
    return config
  },
}

export default nextConfig
