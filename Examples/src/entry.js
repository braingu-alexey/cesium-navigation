import Cesium from 'cesium';
import cesiumNavMixin from '../../dist/index';
import '../../dist/index.css';

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MWE2NTU1Yy1lYTE0LTQ3NjMtYTUzMi1mNDQ0Y2VmNjcwZjciLCJpZCI6MzY1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzODQ0MDc0Mn0.zCOKuoyQpv5oqoo21EP48ool0959nAAJC745-SjaP3k';

const cesiumViewer = new Cesium.Viewer('cesiumContainer');

if (!cesiumNavMixin) {
  console.error('cesiumNavMixin is undefined');
} else {
  // extend our view by the cesium navigation mixin
  cesiumViewer.extend(cesiumNavMixin, {});
}
