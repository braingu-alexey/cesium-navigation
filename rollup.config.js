import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import less from 'rollup-plugin-less'; // eslint-disable-line
import json from 'rollup-plugin-json';

import pkg from './package.json';

const globals = {
  cesium: 'Cesium',
  'knockout-es5': 'ko',
  hammerjs: 'Hammer',
  'markdown-it': 'markdownit',
  'markdown-it-sanitizer': 'markdownitSanitizer',
};

export default {
  input: 'Source/viewerCesiumNavigationMixin.js',
  output: [
    {
      file: pkg.browser_,
      format: 'iife',
      // sourcemap: 'inline',
      globals,
      name: 'viewerCesiumNavigationMixin',
    },
    {
      file: pkg.module,
      format: 'esm',
      // sourcemap: 'inline',
      globals,
    },{
      file: pkg.main,
      format: 'cjs',
      // sourcemap: 'inline',
      globals,
    }
  ],
  external: Object.keys(globals),
  plugins: [
    babel({
      exclude: ['node_modules/**', '**/*.less'],
      externalHelpers: false,
      runtimeHelpers: true,
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    less({ output: pkg.mainCss }),
    json(),
  ]
};
