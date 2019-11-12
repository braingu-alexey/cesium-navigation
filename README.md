# cesium-navigation

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url]

This is a Cesium plugin that adds to the Cesium map a user friendly compass, navigator (zoom in/out), and
distance scale graphical user interface.

This project was forked to provide a stable non-requirejs implementation to be more modern and be publishable to npm. There
is no need to conform to Cesium's insanity of requirejs when tools like webpack and rollup exist.

## How to get it

`yarn install @znemz/cesium-navigation`

## Why did you build it

First of all the Cesiumjs sdk does not include a compass, navigator (zoom in/out) nor distance scale. You can use the mouse to navigate on the map but this navigation plugin offers more navigation control and capabilities to the user.
Some of the capabilities are:
reset the compass to point to north, reset the orbit, and reset the view to a default bound.

## How to build it

- run `yarn install`
- run `yarn start` or `yarn build`

## How did you build it

This plugin is based on the excellent compass, navigator (zoom in/out) and distance scale from the terriajs open source library (https://github.com/TerriaJS). The navigation UI from terriajs can not be used out of the box in Cesium because Cesium uses AMD modules with RequireJS, and the terriajs uses commonjs and Browserify, so you can't just copy the source files into Cesium and build. My work consisted on adapting the code to work within Cesium as a plugin as follows:

- Extracted the minimum required modules from terriajs.
- Converted all the modules from Browserify to requirejs.
- Using nodejs and the requirejs optimizer as well as almond the whole plugin is built and bundled in a single file even the CSS style
- This plugin can be used as a standalone script or via an AMD loader (tested with requirejs). Even in the special case where you use AMD but not for Cesium the plugin can be easily used.

## How to use it

See: [Examples](./Examples/index.html)

## Available options of the plugin

**defaultResetView** - option used to set a default view when resetting the map view with the reset navigation
control. Values accepted are of type Cesium's Cartographic and Rectangle.

**enableCompass** - option used to enable or disable the compass. Values accepted are true for enabling and false to disable. The default is true.

**enableZoomControls** - option used to enable or disable the zoom controls. Values accepted are true for enabling and false to disable. The default is true.

**enableDistanceLegend** - option used to enable or disable the distance legend. Values accepted are true for enabling and false to disable. The default is true.

**units** - option used to set the type of units being displayed. Values accepted are turf helpers units ['kilometers', etc...](https://github.com/Turfjs/turf/blob/v5.1.6/packages/turf-helpers/index.d.ts#L20).

**distanceLabelFormatter** - callback function which allows you to override default [distanceLabelFormater](./Source/Core/Utils.js#88). `(convertedDistance: Number, units : Units): string =>`

More options will be set in future releases of the plugin.

Example of using the options when loading Cesium without requirejs:

```JavaScript
import { Rectangle, Viewer } from 'cesium';

const cesiumViewer = new Viewer();
var options = {};
options.defaultResetView = Rectangle.fromDegrees(71, 3, 90, 14);
// Only the compass will show on the map
options.enableCompass = true;
options.enableZoomControls = false;
options.enableDistanceLegend = false;
options.units = 'kilometers' // default is kilometers;
// turf helpers units https://github.com/Turfjs/turf/blob/v5.1.6/packages/turf-helpers/index.d.ts#L20
options.distanceLabelFormatter = (convertedDistance, units : Units): string => { ... } // custom label formatter
cesiumViewer.extend(window.viewerCesiumNavigationMixin, options);
```

## Others Stuff

- To destroy the navigation object and release the resources later on use the following

```js
viewer.cesiumNavigation.destroy();
```

- To lock the compass and navigation controls use the following. Use true to lock mode,
  false for unlocked mode. The default is false.

```js
viewer.cesiumNavigation.setNavigationLocked(true / false);
```

- if there are still open questions please checkout the examples

## Why browser\_ in package.json

Here is [why](https://github.com/webpack/webpack/issues/4674) and [here](https://github.com/nmccready/cesium-navigation/issues/2).

## [License](./LICENSE)

[downloads-image]: http://img.shields.io/npm/dm/@znemz/cesium-navigation.svg
[npm-image]: https://img.shields.io/npm/v/@znemz/cesium-navigation.svg
[npm-url]: https://www.npmjs.com/package/@znemz/cesium-navigation
[travis-image]: https://img.shields.io/travis/nmccready/cesium-navigation.svg?label=travis-ci
[travis-url]: https://travis-ci.org/nmccready/cesium-navigation
