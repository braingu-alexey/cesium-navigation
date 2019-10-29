import { defined, Ray, Cartesian3, Cartographic, SceneMode } from 'cesium';
import { convertLength } from '@turf/helpers';

const unprojectedScratch = new Cartographic();
const rayScratch = new Ray();

/**
 * gets the focus point of the camera
 * @param {Viewer|Widget} terria The terria
 * @param {boolean} inWorldCoordinates true to get the focus in world coordinates,
 *    otherwise get it in projection-specific map coordinates, in meters.
 * @param {Cartesian3} [result] The object in which the result will be stored.
 * @return {Cartesian3} The modified result parameter, a new instance if none
 *    was provided or undefined if there is no focus point.
 */
export function getCameraFocus(terria, inWorldCoordinates, _result) {
  let result = _result;
  const { scene } = terria;
  const { camera } = scene;

  if (scene.mode === SceneMode.MORPHING) {
    return undefined;
  }

  if (!defined(result)) {
    result = new Cartesian3();
  }

  // TODO bug when tracking: if entity moves the current position
  // should be used and not only the one when starting orbiting/rotating
  // TODO bug when tracking: reset should reset to default view of tracked entity

  if (defined(terria.trackedEntity)) {
    result = terria.trackedEntity.position.getValue(
      terria.clock.currentTime,
      result
    );
  } else {
    rayScratch.origin = camera.positionWC;
    rayScratch.direction = camera.directionWC;
    result = scene.globe.pick(rayScratch, scene, result);
  }

  if (!defined(result)) {
    return undefined;
  }

  if (
    scene.mode === SceneMode.SCENE2D ||
    scene.mode === SceneMode.COLUMBUS_VIEW
  ) {
    result = camera.worldToCameraCoordinatesPoint(result, result);

    if (inWorldCoordinates) {
      result = scene.globe.ellipsoid.cartographicToCartesian(
        scene.mapProjection.unproject(result, unprojectedScratch),
        result
      );
    }
  } else {
    if (!inWorldCoordinates) {
      result = camera.worldToCameraCoordinatesPoint(result, result);
    }
  }

  return result;
}

export const UNITS_TO_ABBREVIATION = {
  meters: 'm',
  millimeters: 'mm',
  centimeters: 'cm',
  kilometers: 'km',
  acres: 'ac',
  miles: 'mi',
  nauticalmiles: 'NM',
  inches: 'inch',
  yards: 'yd',
  feet: 'ft',
  radians: 'rad',
  degrees: 'deg'
};

/**
 * @param  {Number} length
 * @param  {TufHelper.Units} units
 */
export function distanceLabelFormatter(length, units) {
  let fixed = 1;
  if (length < 1) {
    fixed = 2;
    if (units === 'kilometers') {
      /* eslint-disable no-param-reassign */
      units = 'meters';
      length = convertLength(length, 'kilometers', units);
      /* eslint-enable no-param-reassign */
    }
  }

  return `${length.toFixed(fixed)} ${UNITS_TO_ABBREVIATION[units]}`;
}
