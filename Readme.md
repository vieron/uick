<p align="center">
  <a href="https://travis-ci.org/vieron/uick" target="_blank">
    <img src="https://api.travis-ci.org/vieron/uick.png" alt="build status">
  </a>
	<img src="http://dl.dropbox.com/s/s608xft9ie08oe1/uick.jpg" alt="uick logo"/>
</p>


# *uick*

User interface components kit.

**UNDER DEVELOPMENT**


uick aims to be a framework for building rich and customizable user interfaces for modern web browsers. It's composed of multiple UI components, which are completely agnostic and have a single responsibility. If you want selects, pick the `ui-select` component, if you want checkboxes, use `ui-checkbox` and so on…

Each component and *uick* itself are modular [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) components managed by default with [component](https://github.com/component/component) (the package manager) and they include their own styles, images, scripts, etc.



## Usage

There are two ways to use uick. Requiring uick itself or requiring each component separately.
If you require uick, yo can [download builds]() which includes all the uick components available, or preferably [do a custom build]().

In both cases, you should read the API documentation for each component you will be using.

##### Requiring uick

Provides an unified API for all the uick components, which are namespaced under the same object. The uick wrapper is somewhat similar to jQuery style API: select elements from DOM, instance new components and play with the component API. All of these with method chaining.

```
// require uick
var uick = require('uick');

// register uick components that will be used (all should be in the component.json)
uick.register(["checkbox", "select", "input-slider"]);

// create a new instance from an existing checkbox
var check = uick('input[type="checkbox"]').checkbox();

// play with the API
check.api().toggle();

```

If you are not using [component(1)]() as package manager, you can download `uick-standalone` build and you save the `require('uick')` line. In this case `uick` is exposed to the global scope:

```
// create a new instance from an existing checkbox
var check = uick('input[type="checkbox"]').checkbox();

// play with the API
check.api().toggle();

```



##### Requiring components separately

All components are `require()`-able modules, so start `require()`-ing the components you want to use. Note that all uick components are prefixed with `ui-`.

```
// require ui-checkbox component
var checkbox = require('ui-checkbox');
var el = document.querySelectorAll('input[type="checkbox"]');

// create a new instance from an existing checkbox
var check = checkbox(el);

// play with the API
check.toggle());

```




## API

##### `uick(selector)`

##### *~~uick(selector)~~*`.component([opts])`

##### *~~uick(selector).component([opts])~~*`.api()`

##### `uick.register(component_name [, component_class])`




## List of uick components

- [ui-checkbox]()
- [ui-select]()
- [ui-input-slider]()



## Browser support

Chrome, Firefox, Safari, Opera, IE 9+



## uick components guidelines
- Arguments for Class constructors are always HTMLElement, options object.
- One call to the constructor returns one instance. If multiple elements are passed component should take only the first one. Components should not have logic to handle multiple elements and multiple instances.
- All components should have `init` and `destroy` methods.
- Components should not have the following methods: `api`



## Specs

- `destroy` method of uick should call to `destroy` method of each component.




## Installation

  Install with [component(1)](http://component.io):

    $ component install vieron/uick



## Custom build

	$ git clone git@github.com:vieron/uick.git
	$ cd uick
	$ npm install

Remove dependencies you don't want from the `dependencies` array in `component.json`

	$ component install
	$ grunt


## License

  MIT
