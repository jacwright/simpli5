
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
		
		// register
		var register = implementation.register;
		delete implementation.register;
		
		implementation.constructor = function(data) { // the data object for an itemRenderer
			var element = this;
			
			if (!element.tagName) {
				element = this.template.createBound(data);
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
			var attr = attrs[i];
			if (this.hasAttribute(attr)) {
				this[attr] = this.getAttribute(attr);
			}
		}
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
