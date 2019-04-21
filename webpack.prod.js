var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var common = require('./webpack.common.js');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var utils = require('./templates/utils');

var link = utils.link;
var script = utils.script;

/* urls on github pages need to be relative to project
 * See https://stackoverflow.com/a/19173888
*/

var publicPath = '/weather-rescue-demo';
var url = utils.createUrlResolver(publicPath);

var css = [
    link({
        href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css', 
        rel: 'stylesheet', 
        integrity: 'sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm', 
        crossorigin: 'anonymous'
    }),
    link({
        href: 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', 
        rel: 'stylesheet', 
        integrity: 'sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN',
        crossorigin: 'anonymous'
    }),
    link({href: url('css/styles.css'), rel: 'stylesheet'})
];

var js = [
    script({
        crossorigin: '', 
        src: 'https://unpkg.com/react@16.8.6/umd/react.production.min.js', 
        integrity: 'sha384-qn+ML/QkkJxqn4LLs1zjaKxlTg2Bl/6yU/xBTJAgxkmNGc6kMZyeskAG0a7eJBR1'
    }),
    script({
        crossorigin: '', 
        src: 'https://unpkg.com/react-dom@16.8.6/umd/react-dom.production.min.js', 
        integrity: 'sha384-85IMG5rvmoDsmMeWK/qUU4kwnYXVpC+o9hoHMLi4bpNR+gMEiPLrvkZCgsr7WWgV'
    }),
    script({
        crossorigin: 'anonymous',
        src: 'https://polyfill.io/v3/polyfill.min.js?features=Promise'
    }),
];

module.exports = merge(common, {
    mode: 'production',
    devtool: 'none',
    output: {
        publicPath: publicPath
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    plugins: [
        new CleanWebpackPlugin(),
        // replace apiClient with panoptes-client
        new webpack.NormalModuleReplacementPlugin(
            /src\/apiClient\.js/,
            path.resolve(__dirname, 'node_modules', 'panoptes-client/lib/api-client.js')
        ),
        new HtmlWebpackPlugin({
            template: 'templates/index.html',
            filename: 'index.html',
            context: {
                js: js,
                css: css
            }
        })
    ]
});
