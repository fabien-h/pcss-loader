<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# pcss-loader

A loader for Webpack that imports pcss files and return js modules.

## How to setup in your webpack configuration

Install with `npm i -D pcss-loader`. Then your webpack configuration must contain the following module:

```JavaScript
...
module: {
    rules: [
    ...
        {
            // You can use antoher extension
            test: /\.pcss$/i,
            // You can also exclude, but inclusion is
            // more specific and more predictable
            include: 'your_src_folder_path',
            use: {
                loader: 'pcss-loader',
                // Not mandatory
                options: {}
            }
        }
    ]
},
...
```

### Default options

```JavaScript
options: {
    // Set to true to minify the output, important for production
    minified: false,
    // Default values for the env
    presetEnv: {
        stage: 0,
        features: ['css-nesting'],
        browsers: 'cover 100%'
    },
    // Array of additionnal plugins
    // you can add any post-css plugin
    customPlugins: []
}
```

You can read the documentation about [postcss-preset-env](https://github.com/csstools/postcss-preset-env) to learn more about the options you can pass to `presetEnv`.

### Plugins in use

You can add any plugins you want to post-css with the `customPlugins` array. But here are the ones currently in use.

- [postcss-nested](): to use nested css.
- [postcss-preset-env](https://github.com/csstools/postcss-preset-env): to pass a target environment for the transpilation.
- [postcss-import](): to allow `@` imports like `@import 'src/UiAssets/Colors.pcss';`.
- [postcss-simple-vars](): to use scss like `$` vars.
- [cssnano](): to minify the output. Only used if your pass the `minified` option to true.

## Input and output

If you have the two following pcss files:

```SCSS
/* Colors.pcss */
$mainColor: #00c;

/* Styles.pcss */
@import 'src_path/Colors.pcss';

body {
  color: #000;
}

.__SCOPE {
  color: #c00;

  > .example {
    color: $mainColor;
  }
}
```

And you import them in a JavaScript file with `import AppStyles from './AppStyles.pcss';`, you obtain this object:

```JavaScript
{
    hash: "_d9ce6323d17badc0ff20482741b70d84",
    styles: `
        body {
            color: #000;
        }

        ._d9ce6323d17badc0ff20482741b70d84 {
            color: #c00;
        }

        ._d9ce6323d17badc0ff20482741b70d84 > .example {
            color: #00c;
        }
    `,
}
```

It should be injected in a `style` tag in your DOM.

> The value of `styles` will be minified if you pass `minified: true` in the options and will be: `body{color:#000}._8fd83ea9dc8f28944de69aac4284bba3{color:#c00}._8fd83ea9dc8f28944de69aac4284bba3>.example{color:#00c}`

### The `.__SCOPE` class

The loader uses that class to scope your styles. Then you can use the hash returned by the loader as a class for the container and so the styles will be scoped only to his children.

You can also store the hash to make sure that you don't inject twice the same styles.

> The styles in `body` are not nested in the `__SCOPE` class. The loader put them in the global scope.
