module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    useLongPolling: process.env.USE_LONG_POLLING === "true",
    heartbeatInterval: Number(process.env.PP_HEARTBEAT_INTERVAL) || 5000,
    heartbeatTimeout: Number(process.env.PP_HEARTBEAT_TIMEOUT) || 10000,
  },
  webpack5: true,
};
