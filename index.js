var Uick = function(selector, context) {
	return new Uick.fn.init(selector, context);
}

Uick.fn = Uick.prototype = {
	version: '',

	init: function(selector, context) {
		this.el = selector.nodeType ? [selector] : (context, document).querySelectorAll(selector);
	},

	api: function(n) {
		return (n && n.nodeType ? n : this.el[(n || 0)]).component;
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
	cls = cls || Uick.components[name] || require('ui-' + name);
	Uick.components[name] || (Uick.components[name] = cls);

	cls.prototype.api || (cls.prototype.api = function() { return this; });

	Uick.fn[method] = function(opts) {
		var el = this.el,
			l = el.length,
			ins;
		for (var i = 0; i < l; i++) {
			ins = new cls(el[i], opts);
			el[i].component = ins;
			cls.uick = this;
			if (l === 1) { return ins; }
		}
		return this;
	}
};

Uick.error = function(msg) {
	throw new Error(msg);
};

module.exports = Uick;