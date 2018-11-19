(function () {
    "use strict";
    /*jshint node:true*/

    const sourceDir = 'Source';
    const buildDir = 'dist',
        standaloneSubDir = 'standalone',
        amdSubDir = 'amd',
        buildName = 'viewerCesiumNavigationMixin';
    const examplesDir = 'Examples';

    const requirejs = require('requirejs');

    const path = require('path');
    const fs = require('fs-extra');

    const nodeMinify = require('node-minify');

    const minify = function (fileIn, callback) {
        const fileOut = path.join(path.dirname(fileIn), path.basename(fileIn, path.extname(fileIn)) + '.min' + path.extname(fileIn));

        new nodeMinify.minify({
            type: 'uglifyjs',
            fileIn: fileIn,
            fileOut: fileOut,
            callback: function (err) {
                if (err) {
                    console.log(err);
                    return;
                }

                callback(fileOut);
            }
        });
    };

    const shimsGlobal = {},
        shimsBuild = {};
    const licenseComments = [];

    const findAllCesiumReferences = function (absPath) {
        if (fs.lstatSync(absPath).isDirectory()) {
            const files = fs.readdirSync(absPath);

            files.forEach(function (subpath) {
                findAllCesiumReferences(path.join(absPath, subpath));
            });
            return;
        } else if (!fs.lstatSync(absPath).isFile()) {
            return;
        }

        const contents = fs.readFileSync(absPath).toString();

        if (/\.js$/.test(absPath)) {
            // Search for Cesium modules and add shim
            // modules that pull from the Cesium global

            const cesiumRequireRegex = /['"](Cesium\/\w*\/(\w*))['"]/g;
            const match;
            while ((match = cesiumRequireRegex.exec(contents)) !== null) {
                if (!(match[1] in shimsGlobal)) {
                    shimsGlobal[match[1]] = 'define(\'' + match[1] + '\', function() { return Cesium[\'' + match[2] + '\']; });';
                }
                if (!(match[1] in shimsBuild)) {
                    shimsBuild[match[1]] = 'define(\'' + match[1] + '\', [\'Cesium\'],  function(Cesium) { return Cesium[\'' + match[2] + '\']; });';
                }
            }
        } else if (/\.glsl$/.test(absPath)) {
            const newContents = [];

            contents = contents.replace(/\r\n/gm, '\n');

            const licenseComments = contents.match(/\/\*\*(?:[^*\/]|\*(?!\/)|\n)*?@license(?:.|\n)*?\*\//gm);
            if (licenseComments !== null) {
                licenseComments = licenseComments.concat(licenseComments);
            }

            // Remove comments. Code ported from
            // https://github.com/apache/ant/blob/master/src/main/org/apache/tools/ant/filters/StripJavaComments.java
            for (const i = 0; i < contents.length; ++i) {
                const c = contents.charAt(i);
                if (c === '/') {
                    c = contents.charAt(++i);
                    if (c === '/') {
                        while (c !== '\r' && c !== '\n' && i < contents.length) {
                            c = contents.charAt(++i);
                        }
                    } else if (c === '*') {
                        while (i < contents.length) {
                            c = contents.charAt(++i);
                            if (c === '*') {
                                c = contents.charAt(++i);
                                while (c === '*') {
                                    c = contents.charAt(++i);
                                }
                                if (c === '/') {
                                    c = contents.charAt(++i);
                                    break;
                                }
                            }
                        }
                    } else {
                        --i;
                        c = '/';
                    }
                }
                newContents.push(c);
            }

            newContents = newContents.join('');
            newContents = newContents.replace(/\s+$/gm, '').replace(/^\s+/gm, '').replace(/\n+/gm, '\n');
        }
    };

    findAllCesiumReferences(sourceDir);

    shimsGlobal = Object.keys(shimsGlobal).map(function (key) {
        return shimsGlobal[key];
    }).join('\n');
    shimsBuild = Object.keys(shimsBuild).map(function (key) {
        return shimsBuild[key];
    }).join('\n');

    const copyrightHeader = fs.readFileSync(sourceDir + '/copyrightHeader.js').toString();


    // <-- build standalone edition
    const rjsBasicConfig = {
        mainConfigFile: 'mainConfig.js',
        wrap: {
            start: copyrightHeader + '\n' +
                "(function (root, factory) {\n" +
                "    'use strict';\n" +
                "    /*jshint sub:true*/\n\n" +
                "    if (typeof define === 'function' && define.amd) {\n" +
                "        if(require.specified('Cesium/Cesium')) {\n" +
                "            define(['Cesium/Cesium'], factory);\n" +
                "        } else if(require.specified('Cesium')) {\n" +
                "            define(['Cesium'], factory);\n" +
                "        } else {\n" +
                "            define([], factory);\n" +
                "        }\n" +
                "    } else {\n" +
                "        factory();\n" +
                "    }\n" +
                "}(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : this, function (C) {\n\n" +
                "    if (typeof C === 'object' && C !== null) {\n" +
                "        Cesium = C;\n" +
                "    }\n\n" +
                "// <-- actual code\n\n\n",
            end: "\n\n" +
                "// actual code -->\n\n" +
                "    /*global define,require,self,Cesium*/\n" +
                "    " + licenseComments.join('\n        ') + "\n" +
                shimsGlobal + "\n" +
                "    \n" +
                "    const mixin = require('viewerCesiumNavigationMixin');\n" +
                "    if (typeof Cesium === 'object' && Cesium !== null) {\n" +
                "        Cesium['" + buildName + "'] = mixin;\n" +
                "    }\n\n" +
                "    return mixin;" +
                "}));"
        },
        name: 'almond',
        include: ['viewerCesiumNavigationMixin'],
        logLevel: 0
    };

    const rjsConfig = JSON.parse(JSON.stringify(rjsBasicConfig));
    rjsConfig.optimize = 'none';
    rjsConfig.out = path.join(buildDir, standaloneSubDir, buildName + '.js');

    requirejs.optimize(rjsConfig, function (buildResponse) {
        console.log('Built standalone edition ' + rjsConfig.out + ' successfully.');

        minify(rjsConfig.out, function (minFile) {
            console.log('Generated minified ' + minFile);
        });
    });
    // -->


    // <-- build amd compatible edition
    const rjsAMDBasicConfig = {
        mainConfigFile: 'mainConfig.js',
        name: 'viewerCesiumNavigationMixin',
        wrap: {
            start: copyrightHeader + '\n\n',
            end: '\n\n\n'+
                "/*global define,require*/\n" +
                "if(!require.specified('Cesium/Cesium')) {\n" +
                "    if(typeof Cesium === 'object' && Cesium !== null) {\n" +
                shimsGlobal + "\n"+
                "    } else {\n" +
                shimsBuild + "\n"+
                "    }\n" +
                "}\n\n" +
                'define([\'viewerCesiumNavigationMixin\'], function(viewerCesiumNavigationMixin) {\n' +
                '    return viewerCesiumNavigationMixin;\n' +
                '});'
        },
        logLevel: 0
    };

    const rjsAMDConfig = JSON.parse(JSON.stringify(rjsAMDBasicConfig));
    rjsAMDConfig.optimize = 'none';
    rjsAMDConfig.out = path.join(buildDir, amdSubDir, buildName + '.js');
    requirejs.optimize(rjsAMDConfig, function (buildResponse) {
        console.log('Built AMD compatible edition ' + rjsAMDConfig.out + ' successfully.');

        minify(rjsAMDConfig.out, function (minFile) {
            console.log('Generated minified ' + minFile);
        });
    });
    // -->
})();
