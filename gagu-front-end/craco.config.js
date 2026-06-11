const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            warning.module.resource.includes("node_modules") &&
            warning.details &&
            warning.details.includes("source-map-loader")
          );
        },
      ];

      webpackConfig.output.filename = "[name].[contenthash:8].js";
      webpackConfig.output.chunkFilename = "[name].[contenthash:8].chunk.js";

      webpackConfig.plugins.forEach((plugin) => {
        if (plugin instanceof MiniCssExtractPlugin) {
          plugin.options.filename = "[name].[contenthash:8].css";
          plugin.options.chunkFilename = "[name].[contenthash:8].chunk.css";
        }
      });

      return webpackConfig;
    },
  },
};
