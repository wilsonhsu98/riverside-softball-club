var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// ENV
const __PROD__ = process.env.NODE_ENV === 'production';
const __DEV__ = process.env.NODE_ENV === 'development';

let config = {
	entry: {
		app: ['babel-polyfill', './src/main.js'],
		vendor: ['vue', 'vue-router']
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: './',
		filename: 'assets/js/[name].js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules|vendor/,
			loader: 'babel-loader',
			options: {
				presets: ['es2015'],
				plugins: ['transform-runtime']
			}
		}, {
			test: /\.(png|jpg|gif)$/,
			loader: 'url-loader',
			options: {
				limit: 7000,
				name: 'assets/images/[name].[ext]',
				publicPath: __PROD__ ? '../../' : '/'
			}
		}, {
			test: /\.(ico)$/,
			loader: 'file-loader',
			options: {
				name: 'assets/images/[name].[ext]'
			}
		}, {
			test: /\.(woff|woff2|eot|ttf|svg)(\?.*$|$)/,
			loader: 'url-loader?importLoaders=1',
			options: {
				limit: 100000,
				name: 'assets/fonts/[name].[ext]'
			}
		}]
	},
	plugins: [
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: 'vendor',
		// 	filename: 'assets/js/[name].js',
		// 	chunks: ['app', 'vendor']
		// })
	],
	resolve: {
		extensions: ['.js', '.vue'],
		/**
		 * Vue v2.x 之後 NPM Package 預設只會匯出 runtime-only 版本
		 */
		alias: {
			vue: 'vue/dist/vue.js'
		}
	}
};

// Plugins for different environment
if (__PROD__) {
	config.output.filename = 'assets/js/[name].js';
	config.bail = true;
	config.resolve.alias.vue = 'vue/dist/vue.min.js';
	config.module.loaders.push({
		test: /\.vue$/,
		loader: 'vue-loader',
		options: {
			loaders: {
				css: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader'
				}),
				scss: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader']
				})
			}
		}
	}, {
		test: /\.(scss|css)$/,
		loader: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: ['css-loader', 'sass-loader']
		})
	});

	config.plugins = (config.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),
		new webpack.optimize.UglifyJsPlugin({
			comments: false,
			compress: {
				warnings: false
			}
		}),
		new ExtractTextPlugin('assets/css/[name].css'),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/index.html',
			chunks: ['app', 'vendor'],
			inject: false,
			minify: {
				collapseWhitespace: true,
				preserveLineBreaks: true
			},
			env: {
				production: true
			}
		})]
	);
} else {
	config.output.publicPath = '/';
	config.devServer = {
	    contentBase: "./src"
	};
	config.module.loaders.push({
		test: /\.vue$/,
		loader: 'vue-loader',
		options: {
			loaders: {
				scss: 'vue-style-loader!css-loader!sass-loader'
			}
		}
	}, {
		test: /\.(scss|css)$/,
		use: [{
			loader: 'style-loader'
		}, {
			loader: 'css-loader'
		}, {
			loader: 'sass-loader'
		}]
	});

	config.plugins = (config.plugins || []).concat([
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"development"'
			}
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/index.html',
			chunks: ['app', 'vendor'],
			inject: false,
			showErrors: true,
			env: {
				development: true
			}
		})]
	);
}

module.exports = config;