/* eslint-disable @typescript-eslint/no-require-imports */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = function (options, webpack) {
  const lazyImports = [
    'aws-sdk',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    entry: ['./src/lambda.ts'],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              console.log(err);
              return true;
            }
          }
          return false;
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              '../../node_modules/swagger-ui-dist/',
            ),
            to: path.resolve(__dirname, 'dist/'),
          },
        ],
      }),
    ],
  };
};
