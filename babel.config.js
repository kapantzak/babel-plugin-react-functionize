"use strict";

module.exports = function(api) {
  api.cache(true);

  return {
    presets: [],
    plugins: [
      "./src/index.js",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-syntax-jsx"
    ]
  };
};
