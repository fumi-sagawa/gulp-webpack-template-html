//https://glatchdesign.com/blog/gulp-webpack-babel/
//https://qiita.com/tonkotsuboy_com/items/2d4f3862e6d05dc0bea1
//https://qiita.com/koedamon/items/92c986456e4b9e845acd
module.exports = {
  entry: "./src/js/main.js",
  output: {
    filename: "main.js",
  },
  mode: "development", //development or production
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    modules: false,
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
  devtool: "source-map",
};
