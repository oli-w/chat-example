import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    devtool: 'inline-source-map',
    devServer: {
        static: './build', historyApiFallback: true,
    },
    entry: './src/index.tsx',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: { transpileOnly: true },
                    },
                ],
                exclude: /node_modules/,

            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        publicPath: '/',
        path: resolve(dirname(fileURLToPath(import.meta.url)), 'build'),
    },
};
