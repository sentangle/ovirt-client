const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  productionSourceMap: false,
  publicPath: "./",
  css: {
    requireModuleExtension: true, // 是否开启CSSmodule并保留xxx.module.css后缀
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  pages: {
    index: {
      entry: "src/main.ts",
    },
  },
  chainWebpack: (config) => {
    config.resolve.alias.set("@", resolve("src"));
  },
};
