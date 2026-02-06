/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const assetPrefix = basePath ? `${basePath}/` : undefined;
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const useExport = process.env.NEXT_OUTPUT === "export" || useMocks;

const nextConfig = {
  reactStrictMode: true,
  output: useExport ? "export" : undefined,
  basePath,
  assetPrefix,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (useExport) return [];
    const proxyTarget = process.env.NEXT_API_PROXY_TARGET;
    if (!proxyTarget) return [];
    const normalizedTarget = proxyTarget.endsWith("/")
      ? proxyTarget.slice(0, -1)
      : proxyTarget;
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
