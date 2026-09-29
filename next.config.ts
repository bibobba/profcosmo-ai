import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  outputFileTracingExcludes: {
    "/api/generate": [
      "node_modules/onnxruntime-node/bin/napi-v3/darwin/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/win32/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/linux/arm64/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/linux/arm/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/win32/arm64/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/darwin/arm64/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/darwin/x64/**/*",
      "node_modules/onnxruntime-node/bin/napi-v3/win32/x64/**/*",
    ],
  },
};

export default nextConfig;
