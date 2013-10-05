<p align="center">
  <a href="https://travis-ci.org/vieron/uick" target="_blank">
    <img src="https://api.travis-ci.org/vieron/uick.png" alt="build status">
  </a>
	<img src="http://dl.dropbox.com/s/s608xft9ie08oe1/uick.jpg" alt="uick logo"/>
</p>


# *uick*

User interface components kit.

**WIP -  YET NOT VALID TO USE IN REAL PROJECTS**


uick aims to be a framework for building rich and customizable user interfaces for modern web browsers. It's composed of multiple UI components, which are completely agnostic and have a single responsibility. If you want selects, pick the `ui-select` component, if you want checkboxes, use `ui-checkbox` and so on…

Each component and *uick* itself are modular [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) components managed by default with [component](https://github.com/component/component) (the package manager) and they include their own styles, images, scripts, etc.

## Components

### Features

- Components are completely agnostic and have a single responsibility.
- Components are Responsive.
- Components support touch and mouse events.

### Core components or npm packages
- [uick-grunt (npm package)](https://github.com/vieron/uick-grunt)
- [generator-uick-component (npm package)](https://github.com/vieron/generator-uick-component)

### List of available components

#### Form elements
- [ui-select](https://github.com/vieron/ui-select)
- [ui-input-slider](https://github.com/vieron/ui-input-slider)
- [ui-checkbox](https://github.com/vieron/ui-checkbox)


## API

[http://vieron.github.io/uick/](http://vieron.github.io/uick/)


## Browser support

Chrome, Firefox, Safari, Opera, IE 9+


## Installation

  Install with [component(1)](http://component.io):

    $ component install vieron/uick



## TO-DO
- define releases and changelog
- test coverage
- page with build status of all the components
- page listing all dependencies of components
- **uick-components-scss**
    - Each component-specific CSS should be in a separated scss file.
    - Write a css style guide based on [idiomatic-css](https://github.com/necolas/idiomatic-css)
    - Follow [BEM methodology](http://bem.info/)
- ui-radio
- ui-colorpicker
- ✔ travis deploy docs if build passed (http://sleepycoders.blogspot.com.es/2013/03/sharing-travis-ci-generated-files.html)
- ✔ write command for scaffolding
- ✔ generate docs from source code. (https://github.com/senchalabs/jsduck/wiki)
- ✔ run tests in travis with mocha + chai + panthomjs



## Links
- touch event libraries
    - http://www.queness.com/post/11755/11-multi-touch-and-touch-events-javascript-libraries

## License

  MIT
