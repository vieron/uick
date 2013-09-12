var Uick = function(selector, context) {
	return new Uick.fn.init(selector, context);
}

Uick.fn = Uick.prototype = {
	version: '',

	init: function(selector, context) {
		this.components = {}; //instances of components for the current uick instance
		this.el = selector.nodeType ? [selector] : (context, document).querySelectorAll(selector);
	},

	api: function(componentName, n) {
		var firstIsString = typeof componentName === 'string';

		if (firstIsString) {
			if (n && n.nodeType) {
				return n[componentName];
			}

			if (n >= 0) {
				return this.components[componentName][n];
			}

			return this.components[componentName];
		}

		return this.components;
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
			el[i][method] = ins;
			ins.uick = this;
		}
		return this;
	}
};

Uick.error = function(msg) {
	throw new Error(msg);
};

module.exports = Uick;