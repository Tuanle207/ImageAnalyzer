const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DEV_ENV = false;;

module.exports = {
    mode: DEV_ENV ? 'development' : 'production',
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 3000,
        watchOptions: {
            poll: true
        },
        open: 'chrome'
    },
    entry: [
        path.resolve(__dirname, "src", "js", "index.js")
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: './src/index.html'})
    ],
};