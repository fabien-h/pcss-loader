/**
 * Imports
 */
const postCSS = require('postcss');
const postCSSNested = require('postcss-nested');
const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');
const atImport = require('postcss-import');
const simpleVars = require('postcss-simple-vars');
const loaderUtils = require('loader-utils');

module.exports = function(cssSource) {
  /**
   * The loader is asynchronous and will return only
   * from that callback
   */
  const callback = this.async();

  /**
   * Process the hash of the initial file
   * Will be used to avoid duplicates and
   * to scope the end result.
   */
  const hash = `_${loaderUtils.getHashDigest(cssSource, 'md5', 'hex')}`;

  /**
   * Possible options :
   * @param {array} customPlugins : do the loader process wiht css nano
   * @param {boolean} minified : do the loader process wiht css nano
   * @param {object} presetEnv : presets for the transform
   */
  const options = loaderUtils.getOptions(this) || {};

  /**
   * Build the plugins list
   */
  const plugins = [
    atImport, // Alow @import 'path/...';
    simpleVars, // Allow scss like variables use $var: value
    postCSSNested, // Allow nesting
    postcssPresetEnv(
      // Transpilation target or default values
      options.presetEnv || {
        stage: 0,
        // CSS nesting by default
        features: ['css-nesting'],
        // Default value for a large coverage
        browsers: 'cover 100%'
      }
    ),
    ...(options.customPlugins || []) // User plugins
  ];
  // Optional minification ; recommended for production
  if (options.minified) plugins.push(cssnano);

  /**
   * Process the css
   */
  postCSS(plugins)
    .process(cssSource.replace('.SCOPE', `.${hash}`), {
      from: undefined
    })
    .then(result =>
      callback(
        null,
        `module.exports = { hash: '${hash}', styles: \`${result.css}\` }`
      )
    );
};
