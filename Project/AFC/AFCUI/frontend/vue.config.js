const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 输出到Android项目的assets目录
  outputDir: '../app/src/main/assets/html',
  // 修改静态资源路径，确保在WebView中能正确加载
  publicPath: './',
  // 生产环境不生成sourcemap
  productionSourceMap: false,
  // 配置webpack
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // 获取包名称
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // 返回包名称，避免使用符号
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    },
  },
  // CSS配置
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/styles/variables.scss";
        `
      }
    }
  }
}) 