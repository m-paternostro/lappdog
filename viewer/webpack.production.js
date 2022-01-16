import { merge } from 'webpack-merge';

import common from './webpack.common.js';

process.env.NODE_ENV = 'production';

export default merge(common, {
  mode: 'production',
  devtool: 'hidden-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
});
