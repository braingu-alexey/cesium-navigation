import { getElement } from 'cesium';
import Knockout from 'knockout-es5';
import createFragmentFromTemplate from './createFragmentFromTemplate';

export default function loadView(htmlString, _container, viewModel) {
  const container = getElement(_container);

  const fragment = createFragmentFromTemplate(htmlString);

  // Sadly, fragment.childNodes doesn't have a slice function.
  // This code could be replaced with Array.prototype.slice.call(fragment.childNodes)
  // but that seems slightly error prone.
  const nodes = [];

  for (let i = 0; i < fragment.childNodes.length; ++i) {
    nodes.push(fragment.childNodes[i]);
  }

  container.appendChild(fragment);

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    if (node.nodeType === 1 || node.nodeType === 8) {
      Knockout.applyBindings(viewModel, node);
    }
  }

  return nodes;
}
