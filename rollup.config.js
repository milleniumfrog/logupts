import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: './dist/logupts.js',
        output: {
            file: './dist/logupts.umd.js',
            format: 'umd',
            name: 'logupts',
            sourcemap: true,
        },
        plugins: [
            sourcemaps(),
            terser(),
        ],
        context: true,
    },
    {
        input: './dist/loguptssync.js',
        output: {
            file: './dist/loguptssync.umd.js',
            format: 'umd',
            name: 'logupts',
            sourcemap: true
        },
        plugins: [
            sourcemaps(),
            terser(),
        ],
        context: true,
    }
]