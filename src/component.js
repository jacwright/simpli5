
var Component = new Class({
	extend: window.HTMLUnknownElement || HTMLElement, // HTMLUnknownElement for Firefox quirkiness
	
	constructor: function(implementation) {
		// call the constructor inside our custom constructor
		var constructor = implementation.constructor;
		
		// if not component, implement component functionality
		var type = implementation.extend;
		while (type && type != Component) {
			type = type.prototype.__proto__ ? type.prototype.__proto__.constructor : null;
		}
		if (type != Component) {
			var prev = implementation.implement ? implementation.implement : [];
			implementation.implement = prev instanceof Array ? prev.concat([Component]) : [prev, Component];
		}
		
		if (implementation.template && !implementation.template.compiledBound) implementation.template.compileBound();
		
		// register
		var register = implementation.register;
		delete implementation.register;
		
		implementation.constructor = function(data) { // the data object for an itemTemplate
			var element = this;
			this.data = data;
			
			if (!element.tagName && this.template) {
				element = this.template.createBound();
				element.__proto__ = this.__proto__;
				if ( !(element instanceof HTMLElement)) throw 'Components must extend HTMLElement or a subclass.';
			}
			
			element.initialize(); // from Component
			constructor.apply(element, arguments);
			return element;
		}
		
		if (register) {
			simpli5.register(register, implementation.constructor);
		}
		
		return new Class(implementation);
	},
	
	initialize: function() {
		var i, l, evts = this.events, attrs = this.attributes;
		
		// setup custom events
		this.initializeEvents();
		
		// setup custom attributes
		this.initializeAttributes();
	},
	
	initializeEvents: function() {
		var evts = this.events;
		 
		if (!evts) return;
		
		for (var i = 0, l = evts.length; i < l; i++) {
			var evt = evts[i];
			if (this.hasAttribute('on' + evt)) {
				try {
					var listener = eval('(function(event) {' + this.getAttribute('on' + evt) + '})');
				} catch(e) {}
				if (listener) this.on(evt, this, listener);
			}
		}
	},
	
	initializeAttributes: function() {
		var attrs = this.properties;
		
		if (!attrs) return;
		
		for (var i = 0, l = attrs.length; i < l; i++) {
			var attr = attrs[i], prop = this.camelize(attr);
			if (this.hasAttribute(attr)) {
				this[prop] = this.getValue(prop, this.getAttribute(attr));
			}
		}
	},
	
	camelize: function(str) {
		var parts = str.split('-'), len = parts.length;
		if (len == 1) return parts[0];
		
		var camelized = str.charAt(0) == '-'
			? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
			: parts[0];
		
		for (var i = 1; i < len; i++)
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
		
		return camelized;
	},
	
	getValue: function(prop, value) {
		var parsed;
		if (value.indexOf('{') == 0 && value.lastIndexOf('}') == value.length - 1) {
			// handle a bound value
			var component = this;
			value = value.substring(1, value.length - 1);
			Bind.setter(window, value, eval('(function() { try { console.log("updating", dummy); component.' + prop + ' = ' + value + '; } catch (e) {} })'));
		} else if (value.indexOf(',') != -1) {
			parsed = value.split(/\s*,\s*/);
			for (var i = 0, l = parsed.length; i < parsed; i++) {
				parsed[i] = this.getValue(parsed[i]);
			}
			return parsed;
		} else if ((parsed = parseFloat(value)) == value.toString()) {
			return parsed;
		} else if (value == 'true' || value == 'false') {
			return (value == 'true');
		}
		return value;
	}
	
});




var Button = new Component({
	extend: HTMLButtonElement,
	template: new Template('<button></button>'),
	constructor: function() {
		
	},
	get label() {
		return this.text();
	},
	set label(value) {
		this.text(value);
	}
});
