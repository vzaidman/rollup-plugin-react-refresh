# rollup-plugin-react-refresh

Development plugin for [Nollup](https://github.com/PepsRyuu/nollup) / [Rollup](https://rollupjs.org/guide/en/), to enable Hot Module Replacement for React applications. Wraps [react-refresh](https://github.com/facebook/react/tree/master/packages/react-refresh).

See ```example``` on how to use. 

## Using the Plugin

Run ```npm install rollup-plugin-react-refresh react-refresh --save-dev```

Import the plugin and add it to your Rollup configuration during development.

```
import refresh from 'rollup-plugin-react-refresh';

module.exports = {
    plugins: [
        process.env.NODE_ENV === 'development' && refresh()
        // If your "react-refresh" is not installed directly next to "rollup-plugin-react-refresh" You might need to pass the option "reactRefreshRuntimeFilePathRelativeToPlugin".
        // See https://github.com/PepsRyuu/rollup-plugin-react-refresh/pull/10
        // process.env.NODE_ENV === 'development' && refresh({
        //    reactRefreshRuntimeFilePathRelativeToPlugin: 'path/to/some/other/node_modules/react-refresh/cjs/react-refresh-runtime.development.js'
        // })
    ]
}
```

You'll also need to update your ```.babelrc``` to include the ```react-refresh``` Babel transform during development:

```
{
    "presets": ["@babel/preset-react"],
    "env": {
        "development": {
            "plugins": ["react-refresh/babel"]
        }
    }
}
```

Finally, run Nollup:

```
nollup -c
```

You can then start modifying your React components and see changes in your app as you save.