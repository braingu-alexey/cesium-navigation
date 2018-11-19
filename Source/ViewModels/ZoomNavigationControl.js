import { defined, Ray, IntersectionTests, Cartesian3, SceneMode } from 'cesium';

import NavigationControl from './NavigationControl';
import * as Utils from '../Core/Utils';

/**
 * The model for a zoom in control in the navigation control tool bar
 *
 * @alias ZoomOutNavigationControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 * @param {boolean} zoomIn is used for zooming in (true) or out (false)
 */
export default function ZoomNavigationControl(...args) {
  const zoomIn = args[1];
  NavigationControl.apply(this, args);

  /**
   * Gets or sets the name of the control which is set as the control's title.
   * This property is observable.
   * @type {String}
   */
  this.name = `Zoom ${zoomIn ? 'In' : 'Out'}`;

  /**
   * Gets or sets the text to be displayed in the nav control. Controls that
   * have text do not display the svgIcon.
   * This property is observable.
   * @type {String}
   */
  this.text = zoomIn ? '+' : '-';

  /**
   * Gets or sets the CSS class of the control. This property is observable.
   * @type {String}
   */
  this.cssClass = `navigation-control-icon-zoom-${zoomIn ? 'in' : 'out'}`;

  this.relativeAmount = 2;

  if (zoomIn) {
    // this ensures that zooming in is the inverse of zooming out and vice versa
    // e.g. the camera position remains when zooming in and out
    this.relativeAmount = 1 / this.relativeAmount;
  }
}

ZoomNavigationControl.prototype.relativeAmount = 1;

ZoomNavigationControl.prototype = Object.create(NavigationControl.prototype);

/**
 * When implemented in a derived class, performs an action when the user clicks
 * on this control
 * @abstract
 * @protected
 */
ZoomNavigationControl.prototype.activate = function() {
  this.zoom(this.relativeAmount);
};

const cartesian3Scratch = new Cartesian3();

ZoomNavigationControl.prototype.zoom = function(relativeAmount) {
  // this.terria.analytics.logEvent('navigation', 'click', 'zoomIn');

  this.isActive = true;

  if (defined(this.terria)) {
    const { scene } = this.terria;

    const sscc = scene.screenSpaceCameraController;
    // do not zoom if it is disabled
    if (!sscc.enableInputs || !sscc.enableZoom) {
      return;
    }
    // TODO
    //            if(scene.mode == SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
    //                return;
    //            }

    const { camera } = scene;
    let orientation;

    switch (scene.mode) {
      case SceneMode.MORPHING:
        break;
      case SceneMode.SCENE2D:
        camera.zoomIn(
          camera.positionCartographic.height * (1 - this.relativeAmount)
        );
        break;
      default: {
        let focus;

        if (defined(this.terria.trackedEntity)) {
          focus = new Cartesian3();
        } else {
          focus = Utils.getCameraFocus(this.terria, false);
        }

        if (!defined(focus)) {
          // Camera direction is not pointing at the globe, so use the ellipsoid horizon point as
          // the focal point.
          const ray = new Ray(
            camera.worldToCameraCoordinatesPoint(
              scene.globe.ellipsoid.cartographicToCartesian(
                camera.positionCartographic
              )
            ),
            camera.directionWC
          );
          focus = IntersectionTests.grazingAltitudeLocation(
            ray,
            scene.globe.ellipsoid
          );

          orientation = {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll
          };
        } else {
          orientation = {
            direction: camera.direction,
            up: camera.up
          };
        }

        const direction = Cartesian3.subtract(
          camera.position,
          focus,
          cartesian3Scratch
        );
        const movementVector = Cartesian3.multiplyByScalar(
          direction,
          relativeAmount,
          direction
        );
        const endPosition = Cartesian3.add(focus, movementVector, focus);

        if (
          defined(this.terria.trackedEntity) ||
          scene.mode === SceneMode.COLUMBUS_VIEW
        ) {
          // sometimes flyTo does not work (jumps to wrong position)
          // so just set the position without any animation
          // do not use flyTo when tracking an entity because
          // during animation the position of the entity may change
          camera.position = endPosition;
        } else {
          camera.flyTo({
            destination: endPosition,
            orientation,
            duration: 0.5,
            convert: false
          });
        }
      }
    }
  }

  // this.terria.notifyRepaintRequired();
  this.isActive = false;
};
