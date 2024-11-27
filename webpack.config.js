const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  // entry 파일 설정
  // name: path
  mode: "development",
  entry: {
    index: "./src/index.js",
  },
  // HTML 자동 생성 플러그인
  // template를 지정하면 해당 템플릿에 스크립트가 추가됨
  plugins: [
    new HtmlWebpackPlugin({
      title: "cytoscape",
      template: "./index.html",
    }),
  ],
  // 디버깅시 bundle 파일이 아닌 원본 파일의 위치 표기
  devtool: "inline-source-map",
  // 번들 파일 저장소
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  // 코드 스플릿팅
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    runtimeChunk: "single",
  },
  devServer: {
    static: "./dist",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
