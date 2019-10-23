import Knockout from 'knockout-es5';
import {
  defined,
  DeveloperError,
  EllipsoidGeodesic,
  Cartesian2,
  getTimestamp,
  EventHelper
} from 'cesium';
import loadView from '../Core/loadView';

/* eslint-disable no-bitwise */

export default function DistanceLegendViewModel(options) {
  if (!defined(options) || !defined(options.terria)) {
    throw new DeveloperError('options.terria is required.');
  }

  this.terria = options.terria;
  this._removeSubscription = undefined;
  this._lastLegendUpdate = undefined;
  this.eventHelper = new EventHelper();

  this.distanceLabel = undefined;
  this.barWidth = undefined;

  this.enableDistanceLegend = defined(options.enableDistanceLegend)
    ? options.enableDistanceLegend
    : true;

  Knockout.track(this, ['distanceLabel', 'barWidth']);

  this.eventHelper.add(
    this.terria.afterWidgetChanged,
    function() {
      if (defined(this._removeSubscription)) {
        this._removeSubscription();
        this._removeSubscription = undefined;
      }
    },
    this
  );
  //        this.terria.beforeWidgetChanged.addEventListener(function () {
  //            if (defined(this._removeSubscription)) {
  //                this._removeSubscription();
  //                this._removeSubscription = undefined;
  //            }
  //        }, this);

  const that = this;

  function addUpdateSubscription() {
    if (defined(that.terria)) {
      const { scene } = that.terria;
      that._removeSubscription = scene.postRender.addEventListener(function() {
        updateDistanceLegendCesium(this, scene, options.units);
      }, that);
    }
  }

  addUpdateSubscription();
  this.eventHelper.add(
    this.terria.afterWidgetChanged,
    () => {
      addUpdateSubscription();
    },
    this
  );
  // this.terria.afterWidgetChanged.addEventListener(function() {
  //    addUpdateSubscription();
  // }, this);
}

DistanceLegendViewModel.prototype.destroy = function() {
  this.eventHelper.removeAll();
};

DistanceLegendViewModel.prototype.show = function(container) {
  let testing;
  if (this.enableDistanceLegend) {
    testing =
      '<div class="distance-legend" data-bind="visible: distanceLabel && barWidth">' +
      '<div class="distance-legend-label" data-bind="text: distanceLabel"></div>' +
      '<div class="distance-legend-scale-bar" data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' +
      '</div>';
  } else {
    testing =
      '<div class="distance-legend"  style="display: none;" data-bind="visible: distanceLabel && barWidth">' +
      '<div class="distance-legend-label"  data-bind="text: distanceLabel"></div>' +
      '<div class="distance-legend-scale-bar"  data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' +
      '</div>';
  }
  loadView(testing, container, this);
  // loadView(distanceLegendTemplate, container, this);
  // loadView(require('fs').readFileSync(
  //   __dirname + '/../Views/DistanceLegend.html', 'utf8'), container, this);
};

DistanceLegendViewModel.create = function(options) {
  const result = new DistanceLegendViewModel(options);
  result.show(options.container);
  return result;
};

const geodesic = new EllipsoidGeodesic();

const distances = [
  1,
  2,
  3,
  5,
  10,
  20,
  30,
  50,
  100,
  200,
  300,
  500,
  1000,
  2000,
  3000,
  5000,
  10000,
  20000,
  30000,
  50000,
  100000,
  200000,
  300000,
  500000,
  1000000,
  2000000,
  3000000,
  5000000,
  10000000,
  20000000,
  30000000,
  50000000
];

function updateDistanceLegendCesium(_viewModel, scene, units) {
  const viewModel = _viewModel;
  if (!viewModel.enableDistanceLegend) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }
  const now = getTimestamp();
  if (now < viewModel._lastLegendUpdate + 250) {
    return;
  }

  viewModel._lastLegendUpdate = now;

  // Find the distance between two pixels at the bottom center of the screen.
  const width = scene.canvas.clientWidth;
  const height = scene.canvas.clientHeight;

  const left = scene.camera.getPickRay(
    new Cartesian2((width / 2) | 0, height - 1)
  );
  const right = scene.camera.getPickRay(
    new Cartesian2((1 + width / 2) | 0, height - 1)
  );

  const { globe } = scene;
  const leftPosition = globe.pick(left, scene);
  const rightPosition = globe.pick(right, scene);

  if (!defined(leftPosition) || !defined(rightPosition)) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }

  const leftCartographic = globe.ellipsoid.cartesianToCartographic(
    leftPosition
  );
  const rightCartographic = globe.ellipsoid.cartesianToCartographic(
    rightPosition
  );

  geodesic.setEndPoints(leftCartographic, rightCartographic);
  const pixelDistance = geodesic.surfaceDistance;

  // Find the first distance that makes the scale bar less than 100 pixels.
  const maxBarWidth = 100;
  let distance;
  for (let i = distances.length - 1; !defined(distance) && i >= 0; --i) {
    if (distances[i] / pixelDistance < maxBarWidth) {
      distance = distances[i];
    }
  }

  if (defined(distance)) {
    let label;
    if (units === 'nm') {
      if (distance >= 1852) {
        label = `${(distance / 1852).toFixed(1)} nm`;
      } else {
        label = `${(distance / 1852).toFixed(2)} nm`;
      }
    } else {
      if (distance >= 1000) {
        label = `${(distance / 1000).toString()} km`;
      } else {
        label = `${distance.toString()} m`;
      }
    }

    viewModel.barWidth = (distance / pixelDistance) | 0;
    viewModel.distanceLabel = label;
  } else {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
  }
}
