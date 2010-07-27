var Component, Configuration;

(function() {

	/**
	 * Initialize the events for an element
	 * @param obj
	 * @param element
	 */
	function initializeEvents(obj, element) {
		var evts = obj.events;
		 
		if (!evts || navigator.userAgent.indexOf('Firefox') != -1) return;
		
		for (var i = 0, l = evts.length; i < l; i++) {
			var evt = evts[i];
			if (element.hasAttribute('on' + evt)) {
				try {
					var listener = eval('(function(event) {' + element.getAttribute('on' + evt) + '})');
				} catch(e) {}
				if (listener) obj.on(evt, listener.boundTo(obj));
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
			Bind.setter(window, value, eval('(function() { try { component.' + prop + ' = ' + value + '; } catch (e) {} })'));
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
		__isComponent: true,
		
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


var External = new Component({
	extend: Component,
	template: new Template('<external></external>'),
	register: 'external, [external]',
	properties: ['url', 'external', 'auto-load'],
	events: ['loaded'],
	scriptRemoveExp: /<script[\s\S]+?script>/g,
	scriptExp: /<script[^>]*>([\s\S]*?)<\/script>/g,
	scriptSrcExp: /<script[^>]*src="([^"]*)"[^>]*>/,
	
	constructor: function() {
		this.autoLoad = true;
	},
	
	init: function() {
		if (this.external) this.url = this.external;
		if (this.autoLoad && this.url) this.load();
	},
	
	load: function() {
		External.loadCount += 1;
		Ajax.send({
			method: 'get',
			url: this.url,
			complete: this.onLoaded.boundTo(this),
			error: this.onError.boundTo(this)
		});
	},
	
	onLoaded: function(data) {
		External.loadCount -= 1;
		
		if (!data) return;
		
		var html = data.replace(this.scriptRemoveExp, '');
		var nodes = this.replace(html);
		if (nodes.length == 1) {
			var node = nodes[0];
			for (var i = 0; i < this.attributes.length; i++) {
				var attr = this.attributes[i];
				if (attr.nodeName == 'external' || (attr.nodeName == 'url' && this.tagName == 'EXTERNAL')) continue;
				node.setAttribute(attr.nodeName, attr.nodeValue);
			}
		}
		simpli5.mold(nodes);
		
		var head = document.find('head'), match;
		
		while ( (match = this.scriptExp.exec(data)) != null) {
			var script = document.createElement('script'), txt = match[0], content = match[1], src = txt.match(this.scriptSrcExp);
			script.type = 'text/javascript';
			if (src) script.src = src[1];
			script.innerHTML = content;
			head.appendChild(script);
		}
		
		simpli5.checkLoading();
	},
	
	onError: function() {
		External.loadCount -= 1;
	}
});

External.loadCount = 0;
