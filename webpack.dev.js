var fs = require('fs');
var merge = require('webpack-merge');
var common = require('./webpack.common.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var utils = require('./templates/utils');

var link = utils.link;
var script = utils.script;

var publicPath = '/';
var url = utils.createUrlResolver(publicPath);

var css = [
    link({href: url('lib/font-awesome/css/font-awesome.min.css'), rel: 'stylesheet'}),
    link({href: url('lib/bootstrap/css/bootstrap.min.css'), rel: 'stylesheet'}),
    link({href: url('css/styles.css'), rel: 'stylesheet'})
];

var js = [
    script({src: url('lib/polyfill/polyfill.js')}),
]

var links = {
    weatherRescue: "https://www.zooniverse.org/projects/edh/weather-rescue",
    home: url(''),
    table: url('table/'),
    docs: url('docs/')
};

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        stats: {
            maxModules: 1000
        }
    },
    output: {
        publicPath: publicPath
    },
    plugins: [
       new HtmlWebpackPlugin({
            template: 'templates/index.html',
            filename: 'index.html',
            context: {
                css: css,
                js: js
            }
        })
    ]
});
