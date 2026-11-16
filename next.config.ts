import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 75 is next/image's default; the gallery asks for 90 so the photos stay close to the originals.
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return {
      // `curl <site>` (and wget/HTTPie) gets the plain-text invitation instead of HTML.
      // beforeFiles: "/" is a static page, which later rewrite phases would never override.
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "header", key: "user-agent", value: "(curl|Wget|HTTPie|xh)/.*" }],
          destination: "/invitation.txt",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    // For whoever opens the network tab. Header values must be ASCII.
    return [{ source: "/:path*", headers: [{ key: "X-Wedding", value: "Wonse <3 Sohyun; 2027-02-27T15:00:00+09:00" }] }];
  },
};

export default nextConfig;
