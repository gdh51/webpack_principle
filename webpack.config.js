const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: path.join(__dirname, '/src/index.js')
    },

    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'js/[name].[chunkhash:4].js'
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html'
        }),

        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.join(__dirname, '/dist')]
        }),

        new webpack.HashedModuleIdsPlugin()
    ],

    optimization: {
        splitChunks: {
            minSize: 30,
            minChunks: 2,
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'manifest',
                    chunks: 'all'
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },

        minimize: false
    }
}