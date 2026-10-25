const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SQLite di web memakai file WebAssembly
config.resolver.assetExts.push("wasm");

// Header yang dibutuhkan SQLite web (SharedArrayBuffer)
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

module.exports = config;