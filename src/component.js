var Component, Configuration;

(function() {

	/**
	 * Initialize the events for an element
	 * @param obj
	 * @param element
	 */
	function initializeEvents(obj, element) {
		var evts = obj.events;
		 
		if (!evts) return;
		
		for (var i = 0, l = evts.length; i < l; i++) {
			var evt = evts[i];
			if (element.hasAttribute('on' + evt)) {
				try {
					var listener = eval('(function(event) {' + element.getAttribute('on' + evt) + '})');
				} catch(e) {}
				if (listener) obj.on(evt, this, listener);
			}
		}
	}
	
	/**
	 * Initialize the properties from the attributes for an element
	 * @param obj
	 * @param element
	 */
	function initializeAttributes(obj, element) {
		var attrs = obj.properties;
		
		if (!attrs) return;
		
		for (var i = 0, l = attrs.length; i < l; i++) {
			var attr = attrs[i], prop = camelize(attr);
			if (element.hasAttribute(attr)) {
				obj[prop] = getValue(prop, element.getAttribute(attr));
			}
		}
	}
	
	function camelize(str) {
		var parts = str.split('-'), len = parts.length;
		if (len == 1) return parts[0];
		
		var camelized = str.charAt(0) == '-'
			? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
			: parts[0];
		
		for (var i = 1; i < len; i++)
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
		
		return camelized;
	}
	
	function getValue(prop, value) {
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
	
	
	
	Component = new Class({
		extend: window.HTMLUnknownElement || HTMLElement, // HTMLUnknownElement for Firefox quirkiness
		
		constructor: function(implementation) {
			// call the constructor inside our custom constructor
			var constructor = implementation.constructor;
			
			if (implementation.template && !implementation.template.compiledBound) implementation.template.compileBound();
			
			// register
			var register = implementation.register;
			delete implementation.register;
			
			// custom constructor
			implementation.constructor = function(data) { // the data object for an itemTemplate
				var element = this;
				this.data = data;
				
				if (!element.tagName && this.template) {
					element = this.template.createBound();
					element.__proto__ = this.__proto__;
					if ( !(element instanceof HTMLElement)) throw 'Components must extend HTMLElement or a subclass.';
				}
				
				constructor.apply(element, arguments);
				initializeEvents(element, element);
				initializeAttributes(element, element);
				if ('init' in element) element.init();
				return element;
			}
			
			if (register) {
				simpli5.register(register, implementation.constructor);
			}
			
			return new Class(implementation);
		}
		
	});
	
	/**
	 * Elements which represent objects and not actual visual pieces of the display. The
	 * HTMLElement will be removed after the configuration is saved and set up appropriately.
	 */
	Configuration = new Class({
		
		constructor: function(implementation) {
			
			var constructor = implementation.constructor;
			
			// register
			var register = implementation.register;
			delete implementation.register;
			
			// custom constructor
			implementation.constructor = function() {
				var element = this;
				
				constructor.apply(this, arguments);
				initializeEvents(this, element);
				initializeAttributes(this, element);
				element.remove();
				if ('init' in this) this.init();
			}
			
			if (register) {
				simpli5.register(register, implementation.constructor);
			}
			
			return new Class(implementation);
		}
	});

})();
