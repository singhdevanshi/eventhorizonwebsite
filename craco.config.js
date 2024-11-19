// craco.config.js

module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.resolve.fallback = {
          ...webpackConfig.resolve.fallback,
          fs: false,
          stream: require.resolve("stream-browserify"),
          path: require.resolve("path-browserify"),
          zlib: require.resolve("browserify-zlib"),
          crypto: require.resolve("crypto-browserify"),
          querystring: require.resolve("querystring-es3")
        };
        return webpackConfig;
      }
    }
  };
  