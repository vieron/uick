/*! uick - v0.0.3 - 2013-10-08
* http://vieron.net
* Copyright (c) 2013 vieron; Licensed MIT */


;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("yields-prevent/index.js", function(exports, require, module){

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

});
require.register("yields-stop/index.js", function(exports, require, module){

/**
 * stop propagation on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = require('stop');
 *      anchor.onclick = function(e){
 *        if (!some) return require('stop')(e);
 *      };
 * 
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event;
  return e.stopPropagation
    ? e.stopPropagation()
    : e.cancelBubble = true;
};

});
require.register("component-query/index.js", function(exports, require, module){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("vieron-ui-checkbox/index.js", function(exports, require, module){
var classes = require('classes'),
	domify = require('domify'),
	Emitter = require('emitter'),
	events = require('events'),
	prevent = require('prevent'),
	stop = require('stop'),
	template = require('./templates/template.html');


module.exports = UICheckbox;

/**
 * @class UICheckbox
 * Input Checkbox
 *
 * @constructor
 * Creates a new Checkbox instance.
 * @param {HTMLElement} [el] The input HTML element.
 */
function UICheckbox(el) {
	this.el = el || domify(template);

	this.init();
}


var fn = UICheckbox.prototype;
Emitter(fn);

fn.init = function() {
	this.checkbox = this.el.querySelector('input');

	if (!this.checkbox) { return this; }

	this.classes = classes(this.el);
	this.events();

	if (this.checkbox.checked) {
		this.check();
	} else {
		this.uncheck();
	}

	return this;
};

fn.events = function() {
	this.elEvents = events(this.el, this);
	this.elEvents.bind('click', 'onCheck');
};

fn.check = function() {
	this.checkbox.checked = true;
	this.classes
		.remove('ui-checkbox-unchecked')
		.add('ui-checkbox-checked');

	this.emit('change', true);

	return this;
};

fn.uncheck = function() {
	this.checkbox.checked = false;
	this.classes
		.remove('ui-checkbox-checked')
		.add('ui-checkbox-unchecked');

	this.emit('change', false);
	return this;
};

fn.toggle = function() {
	if (this.checkbox.checked) {
		this.uncheck();
	} else {
		this.check();
	}

	return this;
};

fn.name = function(name) {
	if (!name) {
		return this.checkbox.name;
	}

	this.checkbox.name = name;
	return this;
};

fn.onCheck = function(e) {
	prevent(e);
	stop(e);

	this.toggle();
};

fn.unbind = function() {
	if (this.elEvents) {
		this.elEvents.unbind('click', 'onCheck');
	}
};

fn.destroy = fn.unbind;

fn.isChecked = function() {
	return this.checkbox.checked;
};

fn.val = fn.isChecked;
});
require.register("scttnlsn-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  if ('function' != typeof method) method = obj[method];

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    method.apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("yields-scrolltop/index.js", function(exports, require, module){

/**
 * get the window's scrolltop.
 * 
 * @return {Number}
 */

module.exports = function(){
  if (window.pageYOffset) return window.pageYOffset;
  return document.documentElement.clientHeight
    ? document.documentElement.scrollTop
    : document.body.scrollTop;
};

});
require.register("component-keyname/index.js", function(exports, require, module){

/**
 * Key name map.
 */

var map = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta'
};

/**
 * Return key name for `n`.
 *
 * @param {Number} n
 * @return {String}
 * @api public
 */

module.exports = function(n){
  return map[n];
};
});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("yields-data/index.js", function(exports, require, module){

/**
 * expose `data`
 */

module.exports = data;

/**
 * global unique id
 */

data.uniq = 0;

/**
 * global cache.
 */

data.cache = {};

/**
 * api
 */

data.api = {
  has: has,
  del: del,
  set: set,
  get: get
};

/**
 * Get data `api` for the provided `el`.
 *
 * example:
 *
 *        var el = document.scripts[0];
 *
 *        data(el)
 *          .set({ foo: bar })
 *          .set('hello', 'world')
 *
 *        data(el).has('foo')
 *        // > true
 *        data(el).del('foo').has('foo');
 *        // > false
 *
 *        data(el).get();
 *        // > { hello: 'world' }
 *        data(el).get('hello');
 *        // > world
 *        data(el).get('foo');
 *        // > undefined
 *
 * @param {HTMLElement} el
 * @return {Object}
 */

function data (el) {
  var id = el.__uniq || ++data.uniq, cache;
  cache = (data.cache[id] = data.cache[id] || {});
  el.__uniq = id;
  data.api.el = el;
  data.api.cache = cache;
  return data.api;
}

/**
 * Set `key` to `val` or provide
 * an object that will be merged
 * with the element `data`.
 *
 *
 * example:
 *
 *        set({ foo: 'bar' });
 *        set(console).get();
 *        // > { foo: 'bar', log: fn ... }
 *        set('foo', 'hello').get();
 *        // > { foo: 'hello', log: fn }
 *        set({}).get();
 *        // > {}
 *
 * @param {String|Object} name
 * @param {mixed} val
 * @return {self}
 */

function set (name, val) {
  if ('string' != typeof name) {
    for (var k in name) {
      this.cache[k] = name[k];
    }
  } else {
    this.cache[name] = val;
  }

  return this;
}

/**
 * Get `value` where `key`.
 *
 * if `key` argument is omitted
 * the method will return all `data`.
 *
 * note that the method will first
 * attempt to get the `key` from the
 * cache, if it's not there it will attempt
 * to get `data-*` attr.
 *
 * example:
 *
 *            get('foo');
 *            // > null
 *            get();
 *            // > {}
 *
 * @param {String} key
 * @return {mixed}
 */

function get (k) {
  var cache = this.cache, ret;
  if (!k) return cache;
  if (ret = cache[k]) return ret;
  return cache[k] = attr(this.el, k);
}

/**
 * Check whether or not `key` exists.
 *
 * example:
 *
 *          has('foo');
 *          // > false
 *          set('foo', 'bar').has('foo');
 *          // > true
 *
 * @param {String} key
 * @return {bool}
 */

function has (key) {
  return !! this.get(key);
}

/**
 * delete `key` from cache.
 *
 * if `key` is omitted the method
 * will reset the element cache to
 * a new `Object`.
 *
 * example:
 *
 *        set('foo', 'bar');
 *        del('foo').get();
 *        // > {}
 *        set(console).del();
 *        // > {}
 *
 * @param {String} key
 * @return {self}
 */

function del (key) {
  if (key) {
    delete this.cache[key];
  } else {
    data.cache[this.el.__uniq] =
    this.cache = {};
  }

  return this;
}

/**
 * get attribute helper.
 *
 * @param {HTMLElement} el
 * @param {String} k
 */

function attr (el, k) {
  return el.getAttribute('data-' + k);
}

});
require.register("vieron-ui-select/index.js", function(exports, require, module){
var Emitter = require('emitter')
  , domify = require('domify')
  , classes = require('classes')
  , query = require('query')
  , events = require('events')
  , indexOf = require('indexof')
  , keyname = require('keyname')
  , scrolltop = require('scrolltop')
  , bind = require('bind')
  , data = require('data');

/**
 * @class UISelect
 * Select component
 *
 * @constructor
 * Creates a new Select instance.
 * @param {HTMLElement} [select] The original select in DOM.
 * @param {Object} [options] Configuration object.
 */
function UISelect (select, options) {
  this.fromSelect = select && select.tagName == 'SELECT';

  this.fromSelect && (this.selectEl = select);
  options = options || select;

  this.options = {};
  this.selectable = [];
  this.closed = true;
  this.val = undefined;
  this._group = undefined;
  this.placeholder = options.placeholder || '';
  this.searchable = options.search;
  this.tabindex = options.tabindex || UISelect.tabindex++;

  this.init();
}

UISelect.tabindex = 1;

var fn = UISelect.prototype;

/*
 * Inherit from emitter
*/

Emitter(fn);

fn.init = function() {

  if (this.fromSelect) {
    classes(this.selectEl).add('ui-select-hidden');
    this.selectEl.setAttribute('tabindex', -1);
  }

  this.windowEvents = events(window, this);
  this.render();
  this.events = events(this.el, this);

  if (this.fromSelect) {
    this.buildFromSelect();
    this.insertBefore();
  }

  this.el.setAttribute('tabindex', this.tabindex);

  this.bind();
};


fn.addOptionsFromSelect = function(parent) {
  var opts, o, j, jl;
  opts = parent.querySelectorAll('option');
  for (j = 0, jl = opts.length; j < jl; j++) {
    o = opts[j];
    this.add( o.value, o.innerHTML);
  }
};

fn.buildFromSelect = function() {
  var i, l;
  var optgroups = this.selectEl.querySelectorAll('optgroup');

  if (optgroups.length) {
    for (i = 0, l = optgroups.length; i < l; i++) {
      this.group(optgroups[i].label);
      this.addOptionsFromSelect(optgroups[i]);
    }
  } else {
    this.addOptionsFromSelect(this.selectEl);
  }

  return this;
};


/**
 * Render html
 */

fn.render = function () {
  var template = require('./templates/select.html');
  this.el = domify(template);
  this.list = query('.ui-select-options', this.el);
  this.input = query('.ui-select-search', this.el);
  this.classes = classes(this.el);

  this.label = query('.ui-select-label', this.el);
  this.label.innerHTML = this.placeholder;

  if (this.searchable)
    this.addClass('ui-select-searchable');

  return this;
};

/**
 * Bind events
 */

fn.bind = function () {
  var self = this;
  var setFocus = function(e) {
    var el = e.target;
    self.setFocus(data(el).get('value'));
  };

  var select = function(e) {
    stopPropagation(e);
    var el = e.target;
    self.select(data(el).get('value'));
  };

  this.events.bind('keypress', 'onkeypress');
  this.events.bind('keydown', 'onkeydown');
  this.events.bind('mousedown', stopPropagation);
  this.events.bind('mouseup', stopPropagation);
  this.events.bind('keyup', 'onkeyup');
  this.events.bind('change', 'onkeyup');
  this.events.bind('mousedown', 'toggle');

  this.events.bind('mouseup .ui-select-selectable', select);
  this.events.bind('mousedown .ui-select-selectable', select);
  this.events.bind('mouseover .ui-select-selectable', setFocus);

  return this;
};

/**
 * Unbind events
 */

fn.unbind = function () {
  this.events.unbind('keypress');
  this.events.unbind('keydown');
  this.events.unbind('keyup');
  this.events.unbind('change');
  this.events.unbind('mousedown');
  this.events.unbind('mouseup');
  this.events.unbind('mouseover');

  return this.unbindOutside();
};


/**
 * Bind window events
 */

fn.bindOutside = function () {
  this.windowEvents.bind('mousedown', 'close');
  this.windowEvents.bind('mouseup', 'close');
  this.windowEvents.bind('scroll', 'reposition');
  this.windowEvents.bind('resize', 'reposition');
  return this;
};

/**
 * Unbind window events
 */

fn.unbindOutside = function () {
  this.windowEvents.unbind('mousedown', 'close');
  this.windowEvents.unbind('mouseup', 'close');
  this.windowEvents.unbind('scroll', 'reposition');
  this.windowEvents.unbind('resize', 'reposition');
  return this;
};

/**
 * Add option
 */

fn.add = function (value, text, selected) {
  var template = require('./templates/option.html');
  var el = domify(template);
  var list = this._group || this.list;

  el.innerHTML = text;
  this.options[value] = el;
  this.selectable.push('' + value);
  data(el).set({
    'value': value
  });

  list.appendChild(el);

  if (!(this.placeholder || this.val) || selected) {
    this.select(value);
  }

  this.emit('option', value, text);

  return this;
};

/**
 * Remove option
 */

fn.remove = function (value) {
  var option = this.options[value];
  this.el.removeChild(option);
  return this.emit('remove', value);
};

/**
 * Add optiongroup or get the optgroup label of the selected option
 */

fn.group = function (name) {

  if (typeof name == 'undefined') {
    return this.inGroup;
  }

  var template = require('./templates/group.html');
  var el = domify(template);
  var label = query('.ui-select-group-label', el);

  label.innerHTML = name;
  this._group = query('.ui-select-options', el);
  this.list.appendChild(el);

  return this.emit('group', name);
};

/**
 * React to keypress event when closed
 */

var isLetter = /\w/;

fn.onkeypress = function (e) {
  if (!this.closed) return;

  var key = e.keyCode;
  var c = String.fromCharCode(key);

  if (!isLetter.test(c)) return;

  preventDefault(e);
  this.input.value = c;
  this.open();
  this.filter(c);
};

/**
 * React to keydown event
 */

fn.onkeydown = function (e) {
  var key = e.keyCode;
  var current = this.inFocus || this.val;

  switch (keyname(key)) {
    case 'tab':
    case 'esc':
      this.close();
      break;
    case 'enter':
      preventDefault(e);
      this.select(current);
      break;
    case 'left':
    case 'right':
      this.open();
      break;
    case 'up':
      preventDefault(e);
      this.navigate(-1);
      break;
    case 'down':
      preventDefault(e);
      this.navigate(1);
      break;
  }
};

/**
 * React to keyup event
 */

fn.onkeyup = function () {
  this.filter(this.input.value);
};


/**
 * Move focus n positions up or down
 */

fn.navigate = function (n) {
  if (this.closed) return this.open();

  var selectable = this.selectable;
  var i = indexOf(selectable, this.inFocus) + n;

  if (selectable.length > i && i >= 0) {
    var value = selectable[i];
    this.setFocus(value);
  }

  return this;
};

/**
 * Highlight option with the given value
 */

fn.setFocus = function (value) {
  var focus = query('.ui-select-focus', this.list);
  var option = this.options[value];

  if (!option) return this;
  if (focus) classes(focus).remove('ui-select-focus');
  classes(option).add('ui-select-focus');

  this.inFocus = '' + value;
  this.scrollTo(value);

  return this.emit('focus', value);
};

/**
 * Select option with the given value
 */

fn.select = function (value) {
  var option = this.options[value];

  if (!option) return this;

  var selected = query('.ui-select-selected', this.list);
  if (selected) classes(selected).remove('ui-select-selected');
  classes(option).add('ui-select-selected');

  var group = option.parentNode.parentNode;
  if (classes(group).has('ui-select-group')) {
    var label = group.querySelector('.ui-select-group-label');
    this.inGroup = label.innerHTML;
  }

  this.label.innerHTML = option.innerHTML;
  this.val = '' + value;

  this.selectEl && (this.selectEl.value = value);

  this.emit('select', value);
  return this.close();
};

/**
 * Scroll to option with the given value
 */

fn.scrollTo = function (value) {
  var option = this.options[value];
  if (!option) return this;

  var list = query('.ui-select-list', this.el);
  var lh = list.clientHeight;
  var lt = list.scrollTop;
  var lb = lt + lh;

  var oh = option.offsetHeight;
  var ot = option.offsetTop;

  if (ot + oh > lb) {
    list.scrollTop = ot + oh - lh;
  } else if (ot < lt) {
    list.scrollTop = ot;
  }

  return this;
};

/**
 * Reposition select
 */

fn.reposition = function () {
  if (this.closed) return this;

  var wt = scrolltop();
  var wb = wt + window.innerHeight;

  var lh = this.label.offsetHeight;
  var lt = offset(this.el);

  var inner = query('.ui-select-inner', this.el);
  var ih = inner.offsetHeight;

  if (lt + lh + ih <= wb) {
    this.addClass('ui-select-south');
    this.removeClass('ui-select-north');
    return this.emit('position', 'south');
  }

  this.addClass('ui-select-north');
  this.removeClass('ui-select-south');
  return this.emit('position', 'north');
};

/**
 * Filter options by text
 */

fn.filter = function (filter) {
  var reg = new RegExp(filter || '', 'i');
  var selectable = this.selectable = [];

  for (var i in this.options) {
    var option = this.options[i];

    if (reg.test(option.innerHTML)) {
      selectable.push(i);
      classes(option).add('ui-select-selectable');
    } else {
      classes(option).remove('ui-select-selectable');
    }
  }

  this.hideEmpty();
  this.refocus();

  return this.emit('filter', filter);
};

/**
 * Hide empty groups
 */

fn.hideEmpty = function () {
  var groups = query.all('.ui-select-group', this.list);

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var options = query('.ui-select-selectable', group);

    if (options) {
      classes(group).remove('ui-select-empty');
    } else {
      classes(group).add('ui-select-empty');
    }
  }

  return this;
};

/**
 * Refocus if the element in focus is unselectable
 */

fn.refocus = function () {
  var selectable = this.selectable;

  if (~indexOf(selectable, this.inFocus))
    return this.scrollTo(this.inFocus);

  if (!selectable.length)
    return this.setFocus(null);

  return this.setFocus(selectable[0]);
};

/**
 *º Append select to el
 */

fn.appendTo = function (el) {
  el.appendChild(this.el);
  return this;
};


fn.insertBefore = function (el) {
  el || (el = this.selectEl);
  el.parentNode.insertBefore(this.el, el);
  return this;
};

/**
 * Add class to select
 */

fn.addClass = function (name) {
  this.classes.add(name);
  return this;
};

/**
 * Remove class from select
 */

fn.removeClass = function (name) {
  this.classes.remove(name);
  return this;
};

/**
 * Open select
 */

fn.open = function () {
  if (!this.closed) return this;
  return this.toggle();
};

/**
 * Close select
 */

fn.close = function () {
  if (this.closed) return this;
  return this.toggle();
};

/**
 * Toggle select visibility
 */

fn.toggle = function () {
  this.closed = !this.closed;

  this.classes.toggle('ui-select-open');
  this.classes.toggle('ui-select-closed');

  if (this.closed) {
    this.el.focus();
    this.unbindOutside();
    return this.emit('close');
  }

  this.bindOutside();
  this.setFocus(this.val);
  this.reposition();

  var input = this.input;
  tick(function () {
    input.focus();
  });

  return this.emit('open');
};



fn.value = function(val) {
  if (typeof val === 'undefined') { return this.val; }
  this.select(val);
  return this;
};

fn.destroy = fn.unbind;

/**
 * Get element offset
 */

function offset (el, to) {
  var parent = el;
  var top = el.offsetTop;

  while (parent = parent.offsetParent) {
    top += parent.offsetTop;
    if (parent == to) return top;
  }

  return top;
}

/**
 * Prevent default
 */

function preventDefault (e) {
  if (e.preventDefault) return e.preventDefault();
  e.returnValue = false;
}

/**
 * Stop event propagation
 */

function stopPropagation (e) {
  if (e.stopPropagation) return e.stopPropagation();
  e.cancelBubble = true;
}

/**
 * Defer execution
 */

function tick (callback) {
  setTimeout(callback, 0);
}

module.exports = UISelect;
});
require.register("DamonOehlman-stylar/index.js", function(exports, require, module){
/* ~stylar~
 * 
 * Simple Object Query Language
 * 
 * -meta---
 * version:    0.1.5
 * builddate:  2012-10-30T04:14:02.461Z
 * generator:  interleave@0.5.23
 * 
 * 
 * 
 */ 

// umdjs returnExports pattern: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['stylar'] = factory();
    }
}(this, function () {
    var prefixes = ['ms', 'o', 'Moz', 'webkit', ''],
        knownKeys = {},
        getComputed = null,
        reDash = /^(\w+)\-(\w)/,
        reVendorPrefixes = /^\-\w+\-/;
        
    if (document.defaultView && typeof document.defaultView.getComputedStyle == 'function') {
        getComputed = document.defaultView.getComputedStyle;
    }
        
    function sniffProperty(element, attribute) {
        var dashMatch, ii, prefix, prefixedAttr;
        
        // strip off css vendor prefixes
        attribute = attribute.replace(reVendorPrefixes, '');
        
        // convert delimiting dashes into camel case ids
        dashMatch = reDash.exec(attribute);
        while (dashMatch) {
            attribute = dashMatch[1] + dashMatch[2].toUpperCase() + attribute.slice(dashMatch[0].length);
            dashMatch = reDash.exec(attribute);
        }
        
        // search the known prefix
        for (ii = prefixes.length; ii--; ) {
            prefix = prefixes[ii];
            prefixedAttr = prefix ? (prefix + attribute[0].toUpperCase() + attribute.slice(1)) : attribute;
                
            if (typeof element.style[prefixedAttr] != 'undefined') {
                return knownKeys[attribute] = prefixedAttr;
            }
        }
        
        return attribute;
    }
    
    function stylar(elements, attribute, value) {
        var helpers = { get: getter, set: setter };
        
        if (typeof elements == 'string' || elements instanceof String) {
            elements = document.querySelectorAll(elements);
        }
        // if we don't have a splice function, then we don't have an array
        // make it one
        else if (typeof elements.length == 'undefined') {
            elements = [elements];
        } // if..else
        
        function getter(attr, ignoreComputed) {
            var readKey, style;
            
            // get the read key
            readKey = knownKeys[attr] || sniffProperty(elements[0], attr);
    
            // if we have the get computed function defined, and the opts.ignoreComputed is not set
            // then get the computed style fot eh element
            if (getComputed && (! ignoreComputed)) {
                style = getComputed.call(document.defaultView, elements[0]);
            }
            // otherwise, just return the style element 
            else {
                style = elements[0].style;
            }
                
            return style ? style[readKey] : '';
        }
        
        function setter(attr, val) {
            if (typeof attr == 'object' && (! (attr instanceof String))) {
                // if we have been passed an object, then iterate through the keys and update
                // each of the found values
                for (var key in attr) {
                    setter(key, attr[key]);
                }
            }
            else {
                var styleKey = knownKeys[attr] || sniffProperty(elements[0], attr);
    
                for (var ii = elements.length; ii--; ) {
                    elements[ii].style[styleKey] = val;
                }
            }
            
            return helpers;
        }
        
        // iterate through the elements
        
        // if we are in set mode, then update the attribute with the value
        if (typeof attribute == 'undefined') {
            return helpers;
        }
        else if (typeof value != 'undefined') {
            return setter(attribute, value);
        }
        else {
            return getter(attribute);
        }
    }
    
    stylar.sniffProperty = sniffProperty;
    
    return typeof stylar != 'undefined' ? stylar : undefined;
}));
});
require.register("vieron-draggy/lib/draggy.js", function(exports, require, module){
/**
 * draggy.js component
 *
 * A JavaScript/CSS3 microlibrary for moving elements.
 *
 * BROWSER SUPPORT: Safari, Chrome, Firefox, Opera, IE9
 *
 * @author     Stefan Liden
 * @version    0.9.3
 * @copyright  Copyright 2012 Stefan Liden (Jofan)
 * @license    MIT
 */

var stylar = require('stylar'),
    classes = require('classes');

/**
 * Expose `draggy`.
 */

module.exports = Draggy;

// TODO: Remove positioning with component dependencies
// TODO: Replace custom events with component events (or emitter)

var classes = require('classes');

// Some simple utility functions
var util = {
  // PPK script for getting position of element
  // http://www.quirksmode.org/js/findpos.html
  getPosition: function(ele) {
    var curleft = 0;
    var curtop = 0;
    if (ele.offsetParent) {
      do {
        curleft += ele.offsetLeft;
        curtop += ele.offsetTop;
      } while (ele = ele.offsetParent);
    }
    return [curleft,curtop];
  }
};

// Browser compatibility
var ele = document.createElement('div');

var d = document,
    isTouch = 'ontouchstart' in window,
    mouseEvents = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'        
    },
    touchEvents = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    },
    events = isTouch ? touchEvents : mouseEvents;

window.onDrag = d.createEvent('UIEvents');
window.onDrop = d.createEvent('UIEvents');
onDrag.initEvent('onDrag', true, true);
onDrop.initEvent('onDrop', true, true);

function Draggy(attachTo, config) {
  this.attachTo = attachTo;
  this.config   = config || {};
  this.onChange = this.config.onChange || function() {};
  this.position = [0,0];
  this.bindTo   = this.config.bindTo || null;
  this.init();
};

Draggy.prototype = {
  init: function() {
    this.ele           = (typeof this.attachTo === 'string' ? d.querySelector(this.attachTo) : this.attachTo);
    this.ele.draggy    = this;
    this.ele.onChange  = this.onChange;
    this.ele.position  = this.position || [0, 0];
    this.ele.restrictX = this.config.restrictX || false;
    this.ele.restrictY = this.config.restrictY || false;
    this.ele.limitsX   = this.config.limitsX || [-9999, 9999];
    this.ele.limitsY   = this.config.limitsY || [-9999, 9999];
    this.ele.snapBack  = this.config.snapBack || false;
    if (this.bindTo) {
      this.bind(this.bindTo);
    }
    this.enable();
  },
  // Reinitialize draggy object and move to saved position
  reInit: function() {
    this.init();
    this.setTo(this.ele.position[0], this.ele.position[1]);
  },
  // Disable the draggy object so that it can't be moved
  disable: function() {
    this.ele.removeEventListener(events.start, this.dragStart);
  },
  // Enable the draggy object so that it can be moved
  enable: function() {
    this.ele.addEventListener(events.start, this.dragStart);
  },
  // Get current state and prepare for moving object
  dragStart: function(e) {
    var restrictX = this.restrictX,
        restrictY = this.restrictY,
        limitsX = this.limitsX,
        limitsY = this.limitsY,
        relativeX = this.position[0],
        relativeY = this.position[1],
        posX = isTouch ? e.touches[0].pageX : e.clientX,
        posY = isTouch ? e.touches[0].pageY : e.clientY,
        newX, newY,
        self = this; // The DOM element

    // Allow nested draggable elements
    e.stopPropagation();

    classes(this).add('activeDrag');

    d.addEventListener(events.move, dragMove);
    d.addEventListener(events.end, dragEnd);
    
    // Move draggy object using CSS3 translate3d
    function dragMove (e) {
      e.preventDefault();
      var movedX, movedY, relX, relY,
          clientX = isTouch ? e.touches[0].pageX : e.clientX,
          clientY = isTouch ? e.touches[0].pageY : e.clientY;
      if (!restrictX) {
        // Mouse movement (x axis) in px
        movedX = clientX - posX;
        // New pixel value (x axis) of element
        newX = relativeX + movedX;
        if (newX >= limitsX[0] && newX <= limitsX[1]) {
          posX = clientX;
          relativeX = newX;
        }
        else if (newX < limitsX[0]) {
          relativeX = limitsX[0];
        }
        else if (newX > limitsX[1]) {
          relativeX = limitsX[1];
        }
      }
      if (!restrictY) {
        movedY = clientY - posY;
        newY = relativeY + movedY;
        if (newY >= limitsY[0] && newY <= limitsY[1]) {
          posY = clientY;
          relativeY = newY;
        }
        else if (newY < limitsY[0]) {
          relativeY = limitsY[0];
        }
        else if (newY > limitsY[1]) {
          relativeY = limitsY[1];
        }
      }
      self.draggy.position = self.position = [relativeX, relativeY];
      stylar(self).set('transform', 'translate(' + relativeX + 'px,' + relativeY + 'px)');
      self.onChange(relativeX, relativeY);
      self.dispatchEvent(onDrag);
    }
    // Stop moving draggy object, save position and dispatch onDrop event
    function dragEnd (e) {
      self.draggy.position = self.position;
      classes(self.draggy.ele).remove('activeDrag');
      self.dispatchEvent(onDrop);
      d.removeEventListener(events.move, dragMove);
      d.removeEventListener(events.end, dragEnd);
    }

  },
  // API method for moving the draggy object
  // Position is updated
  // Limits and restrictions are adhered to
  // Callback is NOT called
  // onDrop event is NOT dispatched
  moveTo: function(x,y) {
    x = this.ele.restrictX ? 0 : x;
    y = this.ele.restrictY ? 0 : y;
    if (x < this.ele.limitsX[0] || x > this.ele.limitsX[1]) { return; }
    if (y < this.ele.limitsY[0] || y > this.ele.limitsY[1]) { return; }
    stylar(this.ele).set('transform', 'translate(' + x + 'px,' + y + 'px)');
    this.ele.position = this.position = [x,y];
  },
  // API method for setting the draggy object at a certain point
  // Limits and restrictions are adhered to
  // Callback is called
  // onDrop event is dispatched
  setTo: function(x,y) {
    x = this.ele.restrictX ? 0 : x;
    y = this.ele.restrictY ? 0 : y;
    if (x < this.ele.limitsX[0] || x > this.ele.limitsX[1]) { return; }
    if (y < this.ele.limitsY[0] || y > this.ele.limitsY[1]) { return; }
    stylar(this.ele).set('transform', 'translate(' + x + 'px,' + y + 'px)');
    this.ele.onChange(x, y);
    this.ele.position = this.position = [x,y];
    this.ele.dispatchEvent(onDrop);
  },
  // API method for resetting position of draggy object
  reset: function() {
    stylar(this.ele).set('transform', 'translate(' + 0 + 'px,' + 0 + 'px)');
    this.ele.position = [0,0];
  },
  // API method for restricting draggy object to boundaries of an element
  // Sets x and y limits
  // Used internally if config option "bindTo" is used
  bind: function(element) {
    var ele = (typeof element === 'string' ? d.querySelector(element) : element),
        draggyPos, elePos, draggyWidth, eleWidth, draggyHeight, eleHeight,
        xLimit1,  xLimit2, yLimit1, yLimit2;

    xLimit1 = xLimit2 = yLimit1 = yLimit2 = 0;

    if (ele) {
      draggyPos    = util.getPosition(this.ele);
      elePos       = util.getPosition(ele);
      draggyWidth  = parseInt(this.ele.offsetWidth, 10);
      eleWidth     = parseInt(ele.offsetWidth, 10);
      draggyHeight = parseInt(this.ele.offsetHeight, 10);
      eleHeight    = parseInt(ele.offsetHeight, 10);
      if (!this.ele.restrictX) {
        xLimit1      = elePos[0] - draggyPos[0];
        xLimit2      = (eleWidth - draggyWidth) - Math.abs(xLimit1);
      }
      if (!this.ele.restrictY) {
        yLimit1      = elePos[1] - draggyPos[1];
        yLimit2      = (eleHeight - draggyHeight) - Math.abs(yLimit1);
      }

      this.ele.limitsX = [xLimit1, xLimit2];
      this.ele.limitsY = [yLimit1, yLimit2];

    }
  }
};


});
require.register("segmentio-extend/index.js", function(exports, require, module){

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
});
require.register("vieron-ui-input-slider/index.js", function(exports, require, module){
var Draggy = require('draggy'),
	extend = require('extend'),
	classes = require('classes'),
	events = require('events'),
	Emitter = require('emitter'),
	template = require('./templates/template.html');

module.exports = UIInputSlider;

var doc = document;
var defaults = {
	min: 0,
	max: 100,
	handle: '.ui-input-slider-handle',
	sliderArea: '.ui-input-slider-area',
	input: '.ui-input-slider-input',
	fill: '.ui-input-slider-fill',
	theme: '',
	draggy: {
		restrictY: true,
		bindTo: '.ui-input-slider-area'
	}
};


/**
 * @class UIInputSlider
 * Input slider
 *
 * @constructor
 * Creates a new Input Slider instance.
 * @param {HTMLElement} [el] The input HTML element.
 * @param {Object} [opts] Configuration object.
 */
function UIInputSlider(el, opts) {
	var self = this;
	this.el = el;
	this.opts = extend({}, defaults, opts);
	this.opts.draggy = extend({}, defaults.draggy, opts && opts.draggy || {});

	this.opts.draggy.onChange = function(x, y) { self.onChange(x, y) };

	this.init();
}


var fn = UIInputSlider.prototype;
Emitter(fn);

fn.init = function() {
	var val;

	this.handle = this.el.querySelector(this.opts.handle);
	this.area = this.el.querySelector(this.opts.sliderArea);
	this.input = this.el.querySelector(this.opts.input);
	this.fill = this.el.querySelector(this.opts.fill);

	if (!this.handle || !this.area) {
		// throw new Error('handle or sliderArea are required');
		return this;
	}

	this.handleWidth = parseInt(this.handle.offsetWidth, 10);

	classes(this.el).add('ui-theme-' + this.opts.theme);
	this.draggy = new Draggy(this.handle, this.opts.draggy);
	this.prevLimitX = this.draggy.ele.limitsX[1];

	this.events();

	if ((val = this.val()) > 0) {
		this.val(val);
	}

	return this;
};

fn.events = function() {
	this.windowEvents = events(window, this);
	this.windowEvents.bind('resize', 'onResize');

	this.inputEvents = events(this.input, this);
	this.inputEvents.bind('keyup', 'onInputChange');

	return this;
};

fn.unbind = function() {
	this.windowEvents.unbind('resize', 'onResize');
	this.inputEvents.unbind('keyup', 'onInputChange');
	return this;
};

fn.onResize = function(e) {
	this.draggy.bind(this.draggy.bindTo);
	this.reposition();
	this.emit('resize', this);
};

fn.onChange = function(x, y) {
	this.percent = this.getPercent(x);
	this.setFillTo(x, y);
	this.setInputVal(this.percent);
	this.emit('change', x, y, this.percent);
};

fn.getPercent = function(x, y) {
	var d = (parseInt(this.area.offsetWidth, 10) - this.handleWidth) / this.opts.max;
    return parseFloat(x / d, 2);
};

fn.setInputVal = function(value) {
	this.input.value = Math.round(value);
	return this;
};

fn.val = function(val) {
	if (typeof val === 'undefined') {
		val = Math.max(this.opts.min, Math.min(parseFloat(this.input.value), this.opts.max));
		return val;
	}

	val = Math.max(0, Math.min(val, this.opts.max));
	var posX = (parseInt(this.area.offsetWidth - this.handleWidth, 10) * val) / this.opts.max;
	this.draggy.moveTo(posX, 0);
	this.onChange(posX, 0);
	return this;
};

fn.reposition = function() {
	var limitX = this.draggy.ele.limitsX[1];
	var posX = (limitX * this.draggy.position[0]) / this.prevLimitX;
	this.draggy.setTo(posX, 0);

	this.prevLimitX = limitX;
	return this;
};

fn.setFillTo = function(x, y) {
	var d = this.opts.max / 100;
	this.fill.style.width = (this.percent / d) + '%';
	return this;
};

fn.onInputChange = function(e) {
	this.val(this.val());
};

fn.destroy = fn.unbind;

});
require.register("uick/index.js", function(exports, require, module){
/**
 * @class Uick
 * User interface components kit
 */

var Uick = function(selector, context) {
	return new Uick.fn.init(selector, context);
};

Uick.fn = Uick.prototype = {
	version: '',

	/**
	 * @constructor
	 * Creates a new Uick instance.
	 * @param {HTMLElement|String} [select] A CSS selector or a HTMLElement from DOM.
	 * @param {HTMLElement} [context] Find select in context
	 */
	init: function(selector, context) {
		this.components = {}; //instances of components for the current uick instance
		this.el = selector.nodeType ? [selector] : (context, document).querySelectorAll(selector);
	},

	api: function(componentName, n) {
		var firstIsString = typeof componentName === 'string';

		if (firstIsString) {
			if (n && n.nodeType) {
				return n.uick[componentName];
			}

			if (n >= 0) {
				return this.components[componentName][n];
			}

			return this.components[componentName];
		}

		return this.components;
	},

	destroy: function() {
		var i;
		var comps = this.components;
		for (var comp in this.components) {
			for (i = 0; i < comps[comp].length; i++) {
				try {
					comps[comp][i].destroy && comps[comp][i].destroy();
				} catch (e) {
					console.log(e);
				}
			}
		}

		this.components = {};

		var el = this.el;
		for (i = 0; i < el.length; i++) {
			delete el[i].uick;
		}
		this.el = [];

		return this;
	}
};

Uick.fn.init.prototype = Uick.fn;

Uick.components = {};

Uick.register = function(name, cls) {
	if (typeof name === 'object' && name.length) {
		for (var i = 0; i < name.length; i++) {
			Uick.register(name[i], cls);
		}
		return;
	}

	var method = name.replace('-', '_');
	cls = cls || Uick.components[method] || require('ui-' + name);
	Uick.components[method] || (Uick.components[method] = cls);

	cls.prototype.api || (cls.prototype.api = function() { return this; });

	Uick.fn[method] = function(opts) {
		var el = this.el,
			l = el.length,
			ins;

		this.components[method] || (this.components[method] = []);

		for (var i = 0; i < l; i++) {
			ins = new cls(el[i], opts);
			this.components[method].push(ins);
			el[i].uick || (el[i].uick = {});
			el[i].uick[method] = ins;
			ins.uick = this;
		}
		return this;
	};
};

Uick.error = function(msg) {
	throw new Error(msg);
};

module.exports = Uick;
});








require.register("vieron-ui-checkbox/templates/template.html", function(exports, require, module){
module.exports = '<div class="ui-checkbox">\n  <input type="checkbox">\n</div>';
});





require.register("vieron-ui-select/templates/select.html", function(exports, require, module){
module.exports = '<div class="ui-select ui-select-closed" tabindex="0">\n  <div class="ui-select-label"></div>\n  <div class="ui-select-inner">\n    <input type="text" class="ui-select-search">\n    <div class="ui-select-list">\n      <ul class="ui-select-options"></ul>\n    </div>\n  </div>\n</div>';
});
require.register("vieron-ui-select/templates/group.html", function(exports, require, module){
module.exports = '<li class="ui-select-group">\n  <div class="ui-select-group-label"></div>\n  <ul class="ui-select-options"></ul>\n</li>';
});
require.register("vieron-ui-select/templates/option.html", function(exports, require, module){
module.exports = '<li class="ui-select-option ui-select-selectable"></li>';
});


require.register("vieron-ui-input-slider/templates/template.html", function(exports, require, module){
module.exports = '<div class="ui-input-slider">\n	<input type="number" class="ui-input-slider-input">\n    <div class="ui-input-slider-area">\n      <div class="ui-input-slider-handle" draggable="false"></div>\n      <div class="ui-input-slider-inner-area"></div>\n    </div>\n</div>';
});
require.alias("vieron-ui-checkbox/index.js", "uick/deps/ui-checkbox/index.js");
require.alias("vieron-ui-checkbox/index.js", "uick/deps/ui-checkbox/index.js");
require.alias("vieron-ui-checkbox/index.js", "ui-checkbox/index.js");
require.alias("component-classes/index.js", "vieron-ui-checkbox/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-domify/index.js", "vieron-ui-checkbox/deps/domify/index.js");

require.alias("component-emitter/index.js", "vieron-ui-checkbox/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "vieron-ui-checkbox/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("yields-prevent/index.js", "vieron-ui-checkbox/deps/prevent/index.js");

require.alias("yields-stop/index.js", "vieron-ui-checkbox/deps/stop/index.js");

require.alias("component-matches-selector/index.js", "vieron-ui-checkbox/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("vieron-ui-checkbox/index.js", "vieron-ui-checkbox/index.js");
require.alias("vieron-ui-select/index.js", "uick/deps/ui-select/index.js");
require.alias("vieron-ui-select/index.js", "uick/deps/ui-select/index.js");
require.alias("vieron-ui-select/index.js", "ui-select/index.js");
require.alias("component-emitter/index.js", "vieron-ui-select/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-domify/index.js", "vieron-ui-select/deps/domify/index.js");

require.alias("component-classes/index.js", "vieron-ui-select/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "vieron-ui-select/deps/query/index.js");

require.alias("scttnlsn-events/index.js", "vieron-ui-select/deps/events/index.js");
require.alias("component-event/index.js", "scttnlsn-events/deps/event/index.js");

require.alias("component-delegate/index.js", "scttnlsn-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "vieron-ui-select/deps/indexof/index.js");

require.alias("yields-scrolltop/index.js", "vieron-ui-select/deps/scrolltop/index.js");

require.alias("component-keyname/index.js", "vieron-ui-select/deps/keyname/index.js");

require.alias("component-bind/index.js", "vieron-ui-select/deps/bind/index.js");

require.alias("yields-data/index.js", "vieron-ui-select/deps/data/index.js");

require.alias("vieron-ui-select/index.js", "vieron-ui-select/index.js");
require.alias("vieron-ui-input-slider/index.js", "uick/deps/ui-input-slider/index.js");
require.alias("vieron-ui-input-slider/index.js", "uick/deps/ui-input-slider/index.js");
require.alias("vieron-ui-input-slider/index.js", "ui-input-slider/index.js");
require.alias("vieron-draggy/lib/draggy.js", "vieron-ui-input-slider/deps/draggy/lib/draggy.js");
require.alias("vieron-draggy/lib/draggy.js", "vieron-ui-input-slider/deps/draggy/index.js");
require.alias("DamonOehlman-stylar/index.js", "vieron-draggy/deps/stylar/index.js");
require.alias("DamonOehlman-stylar/index.js", "vieron-draggy/deps/stylar/index.js");
require.alias("DamonOehlman-stylar/index.js", "DamonOehlman-stylar/index.js");
require.alias("component-classes/index.js", "vieron-draggy/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("vieron-draggy/lib/draggy.js", "vieron-draggy/index.js");
require.alias("component-emitter/index.js", "vieron-ui-input-slider/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "vieron-ui-input-slider/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("segmentio-extend/index.js", "vieron-ui-input-slider/deps/extend/index.js");

require.alias("component-classes/index.js", "vieron-ui-input-slider/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("vieron-ui-input-slider/index.js", "vieron-ui-input-slider/index.js");
require.alias("uick/index.js", "uick/index.js");if (typeof exports == "object") {
  module.exports = require("uick");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("uick"); });
} else {
  this["uick"] = require("uick");
}})();

uick.register(["checkbox", "select", "input-slider"]);
