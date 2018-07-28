const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');

let pkg = require('./package.json');
let external = [];

// external dependencies
external = external.concat(Object.keys(pkg.dependencies || {}));
// external peer dependencies
external = external.concat(Object.keys(pkg.peerDependencies || {}));

let plugins = [
  babel({
    exclude: ['node_modules/**/*'],
    plugins: ['external-helpers'],
    babelrc: false,
    "presets": [
      ["env", {
        "targets": {
          "browsers": ["> 1%", "ie >= 8"]
        },
        "useBuiltIns": true,
        "modules": false
      }],
      "stage-2",
      "stage-3"
    ]
  })
];

let config = {
  entry: 'index.js',
  plugins: plugins,
  external: external,
  dest: 'dist/gentx-store.common.js',
  format: 'cjs',
  sourceMap: true
}

export default config;
