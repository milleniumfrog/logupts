module.exports = {
    input: 'dist/es2015/logupts.js',
    output: {
        file: 'dist/browser/logupts.js',
        format: 'umd',
        name: 'logupts',
        sourcemap: 'true',
        sourcemapFile: 'dist/browser/logupts.js.map'
    }
}