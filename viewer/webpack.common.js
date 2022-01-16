import { dirname, resolve } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

export const directory = dirname(fileURLToPath(import.meta.url));

export default {
  output: {
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(directory, 'resources/index.html'),
      title: 'LappDog Viewer',
      inject: 'body',
    }),
  ],
};
