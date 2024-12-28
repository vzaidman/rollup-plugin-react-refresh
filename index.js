let fs = require('fs');

const DEFAULT_REACT_REFRESH_PATH = '../react-refresh/cjs/react-refresh-runtime.development.js';

function ReactRefresh (opts = {}) {
    opts.reactRefreshRuntimeFilePathRelativeToPlugin = (
        opts.reactRefreshRuntimeFilePathRelativeToPlugin ||
        DEFAULT_REACT_REFRESH_PATH
    );

    let runtime;
    try {
        runtime = fs.readFileSync(require.resolve(opts.reactRefreshRuntimeFilePathRelativeToPlugin), 'utf8');
    }
    catch(e) {
        throw new Error(
            `[rollup-plugin-react-refresh] ERROR
Node.js forces "rollup-plugin-react-refresh" to require "react-refresh" via a relative import.
It seems like the ${opts.reactRefreshRuntimeFilePathRelativeToPlugin == DEFAULT_REACT_REFRESH_PATH ? 'default ': ''}path "${opts.reactRefreshRuntimeFilePathRelativeToPlugin}" did not resolve the file.".
The resolution has to be from the "rollup-plugin-react-refresh" plugin folder at: "${__dirname}".
Please fix the plugin option "reactRefreshRuntimeFilePathRelativeToPlugin".
See https://github.com/PepsRyuu/rollup-plugin-react-refresh/pull/10 for more info.`,
            {cause: e}
        );
    }

    runtime = runtime.replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV));

    return {
        nollupBundleInit () {
            return `
                (function () {
                    let exports = {}; let module = { exports: exports };

                    ${runtime};

                    window.$RefreshRuntime$ = exports;
                })();
                
                window.$RefreshRuntime$.injectIntoGlobalHook(window);
                window.$RefreshReg$ = () => {};
                window.$RefreshSig$ = () => type => type;
            `
        },

        resolveId (id) {
            if (id === 'react-refresh-runtime') {
                return id;
            }
        },

        load (id) {
            if (id === 'react-refresh-runtime') {
                return `                    
                    export function isReactRefreshBoundary(moduleExports) {
                        for (let key in moduleExports) {
                            let _c = moduleExports[key];
                            if ($RefreshRuntime$.isLikelyComponentType(_c)) {
                                $RefreshReg$(_c, _c.displayName || _c.name);
                            }
                        }

                        if ($RefreshRuntime$.isLikelyComponentType(moduleExports)) {
                            return true;
                        }
                        if (moduleExports == null || typeof moduleExports !== 'object') {
                            // Exit if we can't iterate over exports.
                            return false;
                        }
                        let hasExports = false;
                        let areAllExportsComponents = true;
                        for (const key in moduleExports) {
                            hasExports = true;
                            if (key === '__esModule') {
                                continue;
                            }
                            const desc = Object.getOwnPropertyDescriptor(moduleExports, key);
                            if (desc && desc.get) {
                                // Don't invoke getters as they may have side effects.
                                return false;
                            }
                            const exportValue = moduleExports[key];
                            if (!$RefreshRuntime$.isLikelyComponentType(exportValue)) {
                                areAllExportsComponents = false;
                            }
                        }
                        return hasExports && areAllExportsComponents;
                    };

                    export function __$RefreshCheck$__(m) {
                        if (isReactRefreshBoundary(m.exports)) {
                            m.hot.accept(() => require(m.id))    
                            setTimeout(function () {
                                $RefreshRuntime$.performReactRefresh()
                            }, 0);
                        }
                    }
                `;
            }
        },

        nollupModuleWrap (code) {
            return `
                var prevRefreshReg = window.$RefreshReg$;
                var prevRefreshSig = window.$RefreshSig$;
                var RefreshRuntime = window.$RefreshRuntime$

                 if (RefreshRuntime) {
                    window.$RefreshReg$ = function (type, id) {
                        var fullId = module.id + ' ' + id;
                        RefreshRuntime.register(type, fullId);
                    }
                    window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
                }

                try {
                    ${code}
                } finally {
                    window.$RefreshReg$ = prevRefreshReg;
                    window.$RefreshSig$ = prevRefreshSig;
                }
            `;
        },

        transform (code, id) {
            if (id === 'react-refresh-runtime' || id.includes('node_modules') ) {
                return;
            } 

            if (
                code.indexOf('React.createElement') === -1 && // React < 17
                code.indexOf('react/jsx') === -1 // React 17+ (react/jsx-runtime & react/jsx-dev-runtime)
            ) {
                return;
            }

            return {
                code: [
                    code,
                    'import { __$RefreshCheck$__ } from "react-refresh-runtime"',
                    '__$RefreshCheck$__(module)'
                ].join(';'),
                map: null
            };
        }
    }
}

module.exports = ReactRefresh;