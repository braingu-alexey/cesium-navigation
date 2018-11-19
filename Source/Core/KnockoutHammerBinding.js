import Knockout from 'knockout-es5';
import Hammer from 'hammerjs';

export const KnockoutHammerBinding = {
  register() {
    Knockout.bindingHandlers.swipeLeft = {
      init(element, valueAccessor, allBindings, _viewModel, bindingContext) {
        const f = Knockout.unwrap(valueAccessor());
        new Hammer(element).on('swipeleft', (...args) => {
          const viewModel = bindingContext.$data;
          f.apply(viewModel, args);
        });
      }
    };

    Knockout.bindingHandlers.swipeRight = {
      init(element, valueAccessor, allBindings, _viewModel, bindingContext) {
        const f = Knockout.unwrap(valueAccessor());
        new Hammer(element).on('swiperight', (...args) => {
          const viewModel = bindingContext.$data;
          f.apply(viewModel, args);
        });
      }
    };
  }
};
