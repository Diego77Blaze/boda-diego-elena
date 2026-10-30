import type { NextConfig } from "next";

// En GitHub Pages el sitio vive en /<nombre-del-repo>; el workflow define esta variable.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default config;
