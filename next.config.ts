import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Avoid picking the parent /home/user lockfile as workspace root
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
