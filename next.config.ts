import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Covers all UploadThing app subdomains (*.ufs.sh)
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      {
        // UploadThing legacy CDN
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};
 
export default nextConfig;