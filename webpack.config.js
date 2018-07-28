const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		'logupts.bundle': './src/logupts.ts',
		'logupts.spec': './src/logupts.spec.ts',
		'strplace.spec': './src/strplace.spec.ts',
		'placeholder.spec': './src/placeholder.spec.ts'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [ '.ts', '.js' ]
	}
}