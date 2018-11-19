import Knockout from 'knockout-es5';
import { SvgPathBindingHandler } from 'cesium';
import { KnockoutMarkdownBinding } from './KnockoutMarkdownBinding';
import { KnockoutHammerBinding } from './KnockoutHammerBinding';

export default function registerKnockoutBindings() {
  SvgPathBindingHandler.register(Knockout);
  KnockoutMarkdownBinding.register(Knockout);
  KnockoutHammerBinding.register(Knockout);

  Knockout.bindingHandlers.embeddedComponent = {
    init(element, valueAccessor) {
      const component = Knockout.unwrap(valueAccessor());
      component.show(element);
      return { controlsDescendantBindings: true };
    },
    update() {}
  };
}
