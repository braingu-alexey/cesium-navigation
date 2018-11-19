import Cesium from 'cesium';
import CesiumNavigation from './CesiumNavigation';
import './Styles/cesium-navigation.less';

const { defined, defineProperties, DeveloperError } = Cesium;
/**
 * Created by Larcius on 18.02.16.
 */

/**
 * A mixin which adds the Compass/Navigation widget to the Viewer widget.
 * Rather than being called directly, this function is normally passed as
 * a parameter to {@link Viewer#extend}, as shown in the example below.
 * @exports viewerCesiumNavigationMixin
 *
 * @param {Viewer} viewer The viewer instance.
 * @param {{}} options The options.
 *
 * @exception {DeveloperError} viewer is required.
 *
 * @demo {@link http://localhost:8080/index.html|run local server with examples}
 *
 * @example
 * const viewer = new Cesium.Viewer('cesiumContainer');
 * viewer.extend(viewerCesiumNavigationMixin);
 */
function viewerCesiumNavigationMixin(viewer, options) {
  if (!defined(viewer)) {
    throw new DeveloperError('viewer is required.');
  }

  const cesiumNavigation = init(viewer, options);

  cesiumNavigation.addOnDestroyListener(
    ((_viewer) => () => {
      const v = _viewer;
      delete v.cesiumNavigation;
    })(viewer)
  );

  defineProperties(viewer, {
    cesiumNavigation: {
      configurable: true,
      get: () => viewer.cesiumWidget.cesiumNavigation
    }
  });
}

/**
 *
 * @param {CesiumWidget} cesiumWidget The cesium widget instance.
 * @param {{}} options The options.
 */
viewerCesiumNavigationMixin.mixinWidget = (...args) => init(...args);

/**
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 * @param {{}} options the options
 */
const init = function(viewerCesiumWidget, options) {
  const cesiumNavigation = new CesiumNavigation(viewerCesiumWidget, options);

  const cesiumWidget = defined(viewerCesiumWidget.cesiumWidget)
    ? viewerCesiumWidget.cesiumWidget
    : viewerCesiumWidget;

  defineProperties(cesiumWidget, {
    cesiumNavigation: {
      configurable: true,
      get: () => cesiumNavigation
    }
  });

  cesiumNavigation.addOnDestroyListener(
    (function(_cW) {
      const _cesiumWidget = _cW;
      return function() {
        delete _cesiumWidget.cesiumNavigation;
      };
    })(cesiumWidget)
  );

  return cesiumNavigation;
};

export default viewerCesiumNavigationMixin;
