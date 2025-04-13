const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.resolver.assetExts.push("txt"); // Allow Metro to process .txt files

  return config;
})();
