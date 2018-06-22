/**
 * Imports
 */
const loaderUtils = require('loader-utils');
const postCSS = require('postcss');

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
  let plugins = [
    // Alow @import 'path/...';
    // https://github.com/postcss/postcss-import
    require('postcss-import'),
    // Allow scss like variables use $var: value
    // https://github.com/postcss/postcss-simple-vars
    require('postcss-simple-vars'),
    // Allow nesting like header { h1 {...} a {...} }
    // https://github.com/postcss/postcss-nested
    require('postcss-nested'),
    // Fix flexbox bugs
    // https://github.com/luisrudge/postcss-flexbugs-fixes
    require('postcss-flexbugs-fixes'),
    // Reduces calc() to values (when expressions involve the same units).
    // https://github.com/postcss/postcss-calc
    require('postcss-calc'),
    // Supports variables, using syntax from the W3C Custom Properties
    // https://github.com/postcss/postcss-custom-properties
    require('postcss-custom-properties'),
    // Allow <= and => statements to media queries
    // https://github.com/postcss/postcss-media-minmax
    require('postcss-media-minmax'),
    // Presets for compilation target
    // https://github.com/csstools/postcss-preset-env
    require('postcss-preset-env')(
      // Transpilation target or default values
      options.presetEnv || {
        stage: 0,
        // CSS nesting by default
        features: ['css-nesting'],
        // Default value for a large coverage
        browsers: 'cover 100%',
      },
    ),
  ];
  // Optional minification ; recommended for production
  // https://github.com/cssnano/cssnano
  if (options.minified)
    plugins = [...plugins, require('cssnano')({ zindex: false })];

  // If the user has selected custom plugins
  if (
    options.customPlugins &&
    Array.isArray(options.customPlugins) &&
    options.customPlugins.length > 0
  )
    plugins = [...plugins, ...options.customPlugins];

  // Process the css width the plugins
  postCSS(plugins)
    .process(
      // Scope the styles with the hash of the initial file
      cssSource.replace('.__SCOPE', `.${hash}`),
      {
        from: undefined,
      },
    )
    .then(result =>
      callback(
        // null means no error
        null,
        // produces a file that can be imported in javascript
        `module.exports = {
          hash: '${hash}',
          styles: \`${result.css}\`
        }`,
      ),
    )
    .catch(error => {
      // Format the error
      console.error(`Name: ${error.name}
Reason: ${error.reason}
Line: ${error.line}
Column: ${error.column}`);

      if (error.file) this.addDependency(error.file);

      // Return for the client with the error
      callback(
        error.name === 'CssSyntaxError' ? new SyntaxError(error) : error,
        `module.exports = {
          hash: '${hash}',
          styles: '',
          cssParsingError: {
            name: '${error.name}',
            reason: '${error.reason}',
            line: '${error.line}',
            column: '${error.column}',
          } }`,
      );
    });
};
