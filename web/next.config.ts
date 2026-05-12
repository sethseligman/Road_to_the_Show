import type { NextConfig } from "next";
import path from "path";

/** Pin Turbopack to this app so a lockfile in a parent folder (e.g. $HOME) does not break dev. */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
