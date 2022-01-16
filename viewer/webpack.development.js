import { merge } from 'webpack-merge';

import common, { directory } from './webpack.common.js';

process.env.NODE_ENV = 'development';

export default merge(common, {
  mode: 'development',
  devServer: {
    static: {
      directory: `${directory}/resources/`,
    },
    compress: true,
    hot: true,
    port: 4040,

    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/env', (req, res) => {
        const name = req.query.name;
        if (name) {
          const names = Array.isArray(name) ? name : [name];

          let hasKey = false;
          const map = names.reduce(
            (obj, n) => {
              const value = process.env[n];
              if (value !== undefined) {
                obj[n] = value;
                hasKey = true;
              }
              return obj;
            },
            {},
          );

          if (hasKey) {
            return res.send(map);
          }
        }
        return res.sendStatus(204);
      });
      return middlewares;
    },
  },
});
