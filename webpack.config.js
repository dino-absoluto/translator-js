/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const merge = require('lodash/merge')

const defaultConfigs = {
  mode: 'development',
  target: 'node',
  entry: './src/cli/cli.ts',
  output: {
    pathinfo: false,
    filename: 'cli.js',
    path: path.resolve(__dirname, '__tmp__/new')
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        }
      }, {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  },
  externals: [
    nodeExternals()
  ]
}

module.exports = [
  merge({}, defaultConfigs, {
    name: 'dev',
    output: {
      path: path.resolve(__dirname, '__tmp__/bin')
    },
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    }
  }),
  merge({}, defaultConfigs, {
    name: 'minify',
    mode: 'production',
    output: {
      path: path.resolve(__dirname, 'dist/')
    }
  })
]
