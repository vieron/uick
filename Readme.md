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


## Features

- Components are completely agnostic and have a single responsibility
- Components are Responsive
- Components support touch and mouse events.


## Components

## Core components or npm packages
- uick-query
- uick-grunt
- uick-components-scss

### Form elements
- ui-select
- ui-input-slider
- ui-checkbox
- ui-radio
- ui-colorpicker


## Tech specs

- Components should have tests covering at least all API methods.
- Class constructors receive allways the same **arguments** at first: `el` and `options`.
- If multiple elements are passed to the Component constructor, it should take only the first one. Components should not have logic to handle multiple elements and multiple instances, it's `uick`'s job.
- Components should not implement the following methods: `api`
- Components should have `init` and `destroy` methods.
- If a Component requires CSS should include `uick-components-scss` to inherit common styles.
- Components should use `uick-query` for querying the DOM.
- Components should include as little CSS as possible, discard appeareance styles not needed.

**Ideas**
- If some component needs to be responsive, write a uick module similar to: http://kumailht.com/responsive-elements/



### uick-components-scss
- Each component-specific CSS should be in a separated scss file.
- Write a css style guide based on [idiomatic-css](https://github.com/necolas/idiomatic-css)
- Follow [BEM methodology](http://bem.info/)


## uick components guidelines



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

[http://vieron.github.io/uick/](http://vieron.github.io/uick/)

##### `uick(selector)`

##### *~~uick(selector)~~*`.component([opts])`

##### *~~uick(selector).component([opts])~~*`.api()`

##### `uick.register(component_name [, component_class])`


## Browser support

Chrome, Firefox, Safari, Opera, IE 9+


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


- `travis encrypt -r <user>/<repository> GH_TOKEN=c2d11f0d7740bd2562374b3bdd39c85937960caa --add env.global`



## Create a component
- `$ git clone uick-component-boilerplate`
- `$ npm install`
- `$ component install`
- `$ gem install jsduck -v=4`
- `$ grunt`
- `$ grunt test`
- `$ grunt docs`
- create a repo on github, the name should start by: 'ui-'
- change uick-component-boilerplate remote to your new repo clone url
- create a gh-pages branch (travis will push documentation to it if build success)
- generate token for github project
    - `$ curl -X POST -u <your_github_username> -H "Content-Type: application/json" -d "{\"scopes\":[\"public_repo\"],\"note\":\"token for pushing from travis\"}" https://api.github.com/authorizations`
    - `$ cd ui-<your-component>`
    - `$ gem install travis`
    - `$ travis encrypt -r <user>/<repository> GH_TOKEN=<token> --add env.global`

- Add env var to .travis.yml: REPO="<user>/<repository>"
- `$ git push -u origin master`


## TO-DO
- travis deploy docs if build passed (http://sleepycoders.blogspot.com.es/2013/03/sharing-travis-ci-generated-files.html)
- define releases and changelog
- write command for scaffolding
- generate docs from source code. (https://github.com/senchalabs/jsduck/wiki)
- test coverage
- page with build status of all the components
- page listing all dependencies of components

## License

  MIT

