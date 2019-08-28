import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';

export default [
    {
        input: './dist/logupts.js',
        output: {
            file: './dist/logupts.umd.js',
            format: 'umd',
            name: 'logupts',
            sourcemap: true,
            globals: {
                strplace: 'strplace'
            }
        },
        plugins: [
            resolve(),
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
            sourcemap: true,
            globals: {
                strplace: 'strplace'
            }
        },
        plugins: [
            resolve(),
            sourcemaps(),
            terser(),
        ],
        context: true,
    }
]