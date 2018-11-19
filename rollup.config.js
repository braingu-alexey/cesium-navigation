import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const globals = {
  lodash: 'lodash',
  immutable: 'immutable'
};

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.browser,
      format: 'cjs',
      sourceMap: true,
      globals
    },
    {
      file: pkg.module,
      format: 'esm',
      sourceMap: true,
      globals
    },
    {
      file: pkg.main,
      format: 'cjs',
      sourceMap: true,
      globals
    }
  ],
  external: Object.keys(globals),
  plugins: [
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
      runtimeHelpers: true
    }),
    resolve({
      browser: true
    }),
    commonjs()
  ]
};
