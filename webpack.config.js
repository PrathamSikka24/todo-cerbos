const path = require("path");

module.exports = {
  mode: "development",
  entry: "./index.js", // Adjust this path as needed
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js"],
    modules: ["node_modules"],
  },
  stats: {
    errorDetails: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
