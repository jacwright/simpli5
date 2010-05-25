(function() {
	
var window = this, undefined,
		spaceExpr = /\s+/, dashExpr = /([A-Z])/g, htmlExpr = /^[^<]*(<(.|\s)+>)[^>]*$/, numCSSExpr = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		div = document.createElement('div'),
		array = Array.prototype, element = HTMLElement.prototype;

/**
 * Returns an instance of simpli5
 * @param [selector]
 * @param [context]
 */
var simpli5 = function(selector, context) {
	// allow to be called as a function or created as an object
	if (this instanceof simpli5 && !this.inited) {
		return this.init(selector, context);
	} else {
		return new simpli5(selector, context);
	}
};
window.simpli5 = simpli5;
if ( !('$' in window)) window.$ = simpli5;

simpli5.fn = simpli5.prototype = {
	constructor: simpli5,
	concat: function(args) {
		return new simpli5(array.concat.apply(this, arguments), this.context);
	},
	every: array.every,
	filter: function(func, thisObj) {
		return new simpli5(array.filter.call(this, func, thisObj), this.context);
	},
	forEach: array.forEach,
	indexOf: array.indexOf,
	join: array.join,
	lastIndexOf: array.lastIndexOf,
	map: function(func, thisObj) {
		return new simpli5(array.map.call(this, func, thisObj), this.context);
	},
	pop: array.pop,
	push: array.push,
	reduce: array.reduce,
	reduceRight: array.reduceRight,
	reverse: array.reverse,
	shift: array.shift,
	slice: function(start, end) {
		return new simpli5(array.slice.call(this, start, end), this.context);
	},
	some: array.some,
	sort: array.sort,
	splice: function(startIndex, howMany, args) {
		return new simpli5(array.splice.apply(this, arguments), this.context);
	},
	unshift: array.unshift,
	
	init: function(selector, context) {
		var elems;
		this.context = context || document;
		this.inited = true;
		
		// Handle an empty list
		if (!selector) {
			return;
		// Handle $(DOMElement)
		} else if (selector.nodeType) {
			this.push(selector);
			this.context = selector;
		// HANDLE: $(selector)
		} else if (typeof selector === "string") {
			this.merge(this.context.querySelectorAll(selector));
		// HANDLE: $(function) -- Shortcut for document ready
		} else if (typeof selector == 'function') {
			return simpli5.onReady(selector);
		} else {
			this.merge(selector);
		}
	},
	
	extend: function(extension) {
		var thisObj = this;
		if (arguments.length == 2) {
			thisObj = arguments[0];
			extension = arguments[1];
		}
		for (var i in extension) {
			thisObj[i] = extension[i];
		}
	},
	
	merge: function(elems) {
		if ( !(elems instanceof Array) && 'length' in elems) {
			elems = simpli5.toArray(elems);
		}
		if (elems instanceof Array) {
			this.push.apply(this, elems);
		} else {
			this.push(elems);
		}
	},
	
	find: function(selector) {
		var results = new simpli5();
		this.forEach(function(elem) {
			results.merge(elem.querySelectorAll(selector));
		});
	},
	
	toString: function() {
		return 'simpli5: [' + this.join(',') + ']';
	}
};

simpli5.extend = simpli5.prototype.extend;
simpli5.node = Node.prototype;
simpli5.node.extend = simpli5.extend;
simpli5.element = element;
simpli5.element.extend = simpli5.extend;

simpli5.extend({
	
	onReady: function(listener) {
		document.on('DOMContentLoaded', listener);
	},
	
	forEach: function(iterable, func) {
		array.forEach.call(iterable, func);
	},
	
	toArray: function(iterable) {
		return array.slice.call(iterable);
	},
	
	fragment: function(html) {
		if (html instanceof Node) return html;
		
		var frag = document.createDocumentFragment();
		if (typeof html == 'string') {
			div.innerHTML = html;
			while (div.firstChild) {
				frag.appendChild(div.firstChild);
			}
		} else if (html instanceof Array || html instanceof NodeList) {
			for (var i = 0, l = html.length; i < l; i++) {
				frag.appendChild(html[i]);
			}
		}
		return frag;
	},
	
	html: function(html) {
		return this.fragment(html).firstChild;
	},
	
	map: function(mapping) {
		var map = simpli5.map, fn = simpli5.fn, element = simpli5.element, node = simpli5.node;
		for (var i in mapping) {
			var type = mapping[i];
			simpli5.fn[i] = map[type](element[i] || node[i]);
		}
	}
});

simpli5.extend(simpli5.map, {
	some: function(func) {
		return function() {
			var args = arguments;
			return this.some(function(element) {
				return func.apply(element, args);
			});
		};
	},
	every: function(func) {
		return function() {
			var args = arguments;
			return this.every(function(element) {
				return func.apply(element, args);
			});
		};
	},
	forEach: function(func) {
		return function() {
			var args = arguments;
			this.forEach(function(element) {
				func.apply(element, args);
			});
			return this;
		};
	},
	merge: function(func) {
		return function() {
			var args = arguments;
			var results = new simpli5();
			this.forEach(function(element) {
				results.merge(func.apply(element, args));
			});
			return results;
		};
	},
	getterSetter: function(func) {
		return function() {
			var args = arguments;
			if (args.length == 1) {
				return this.length ? func.call(this[0], args[0]) : undefined;
			}
			this.forEach(function(element) {
				func.apply(element, args);
			});
			return this;
		};
	},
	returnFirst: function(func) {
		return function() {
			return func.apply(this[0], arguments);
		};
	}
});


// DOM Extensions
simpli5.node.extend({
	parent: function(selector) {
		var node = this.parentNode;
		while (node) {
			if (node.matches(selector)) return node;
			node = node.parentNode;
		}
	}
});
HTMLDocument.prototype.findFirst = HTMLDocument.prototype.querySelector;
simpli5.element.extend({
	find: function(selector) {
		return new simpli5(selector, this);
	},
	findFirst: element.querySelector,
	matches: (element.webkitMatchesSelector || element.mozMatchesSelector),
	addClass: function(className) {
		var classes = this.className.split(spaceExpr);
		if (classes.indexOf(className) == -1) {
			classes.push(className);
			this.className = classes.join(' ');
		}
		return this;
	},
	removeClass: function(className) {
		var classes = this.className.split(spaceExpr);
		var index = classes.indexOf(className);
		if (index != -1) classes.splice(index, 1);
		if (classes.length == 0) this.removeAttr('class');
		else this.className = classes.join(' ');
		return this;
	},
	hasClass: function(className) {
		return this.className.split(spaceExpr).indexOf(className) != -1;
	},
	toggleClass: function(className) {
		if (this.hasClass(className)) this.removeClass(className);
		else this.addClass(className);
		return this;
	},
	attr: function(name, value) {
		if (typeof name == 'object') {
			for (var i in name) {
				this.setAttribute([i], name[i]);
			}
		} else if (value !== undefined) {
			this.setAttribute(name, value);
			return this;
		} else {
			return this.getAttribute(name);
		}
	},
	css: function(name, value) {
		if (typeof name == 'object') {
			for (var i in name) {
				this.css(i, name[i]);
			}
		} else if (value !== undefined) {
			if (typeof value == 'number' && !numCSSExpr.test(name)) {
				value += 'px';
			}
			this.style[name] = value;
			return this;
		} else {
			value = this.style[name];
			if (!value) {
				name = name.replace(dashExpr, "-$1").toLowerCase();
				var computedStyle = window.getComputedStyle(this, null);
				value = computedStyle.getPropertyValue(name);
			}
			return value;
		}
	},
	removeAttr: function(name) {
		this.removeAttribute(name);
		return this;
	},
	make: function(classType) {
		this.__proto__ = classType.prototype || classType.__proto__;
		var args = simpli5.toArray(arguments);
		args.shift();
		if ('init' in this) this.init.apply(this, args);
		return this;
	},
	html: function(value) {
		if (value === undefined) {
			return this.innerHTML;
		} else {
			this.innerHTML = value;
		}
		return this;
	},
	text: function(value) {
		if (value === undefined) {
			return this.innerText;
		} else {
			this.innerText = value;
		}
		return this;
	},
	cleanWhitespace: function() {
		var node = this.firstChild;
		while (node) {
			var curNode = node;
			node = node.nextSibling;
			if (curNode.nodeType == 3) {
				this.removeChild(curNode);
			}
		}
	},
	val: function(value) {
		if (value === undefined) {
			if (this.nodeName == 'SELECT' && this.type == 'select-multiple') {
				var i = this.selectedIndex, values = [], options = this.options;
				if (i == -1) return values;
				
				// Loop through all the selected options
				for (var l = options.length; i < l; i++) {
					var option = options[i];
					if (option.selected) {
						values.push(option.value);
					}
				}
				
				return values;				
			}
			return (this.value || '').replace(/\r/g, '');
		}
		
		if (typeof value === "number") value += '';
		
		if (value instanceof Array && this.type == 'radio' || this.type == 'checkbox') {
			this.checked = value.indexOf(this.value) != -1;
		} else if (this.nodeName == 'SELECT') {
			if (value) {
				var values = value instanceof Array ? value : [value], options = this.options;
				
				for (var i = 0, l = options.length; i < l; i++) {
					var option = options[i];
					if (values.indexOf(option.value) != -1) {
						option.selected = true;
					}
				}
			} else {
				this.selectedIndex = -1;
			}
		} else {
			this.value = value;
		}
	},
	after: function(html) {
		var frag = simpli5.fragment(html);
		var nodes = simpli5.toArray(frag.childeNodes);
		this.parentNode.insertBefore(frag, this.nextSibling);
		return nodes;
	},
	append: function(html) {
		var frag = simpli5.fragment(html);
		var nodes = simpli5.toArray(frag.childeNodes);
		this.appendChild(frag);
		return nodes;
	},
	before: function(html) {
		var frag = simpli5.fragment(html);
		var nodes = simpli5.toArray(frag.childeNodes);
		this.parentNode.insertBefore(frag, this);
		return nodes;
	},
	prepend: function(html) {
		var frag = simpli5.fragment(html);
		var nodes = simpli5.toArray(frag.childeNodes);
		this.insertBefore(frag, this.firstChild);
		return nodes;
	},
	data: function(name, value) {
		if (value === undefined) {
			if ('_data' in this) return this._data[name];
		} else {
			if ( !('_data' in this)) this._data = {};
			return this._data[name];
		}
	},
	outerWidth: function(value) {
		if (value === undefined) {
			return this.offsetWidth;
		} else {
			var padding = parseInt(this.css('paddingLeft')) + parseInt(this.css('paddingRight'));
			var border = parseInt(this.css('borderLeftWidth')) + parseInt(this.css('borderRightWidth'));
			this.css('width', Math.max(value - padding - border, 0));
		}
	},
	outerHeight: function(value) {
		if (value === undefined) {
			return this.offsetHeight;
		} else {
			var padding = parseInt(this.css('paddingTop')) + parseInt(this.css('paddingBottom'));
			var border = parseInt(this.css('borderTopWidth')) + parseInt(this.css('borderBottomWidth'));
			this.css('height', Math.max(value - padding - border, 0));
		}
	},
	width: function(value) {
		if (value === undefined) {
			var padding = parseInt(this.css('paddingLeft')) + parseInt(this.css('paddingRight'));
			var border = parseInt(this.css('borderLeftWidth')) + parseInt(this.css('borderRightWidth'));
			return this.offsetWidth - padding - border;
		} else {
			this.css('width', Math.max(value, 0));
		}
	},
	height: function(value) {
		if (value === undefined) {
			var padding = parseInt(this.css('paddingTop')) + parseInt(this.css('paddingBottom'));
			var border = parseInt(this.css('borderTopWidth')) + parseInt(this.css('borderBottomWidth'));
			return this.offsetHeight - padding - border;
		} else {
			this.css('height', Math.max(value, 0));
		}
	},
	rect: function(value) {
		if (value === undefined) {
			var rect = this.getBoundingClientRect();
			// allowing returned object to be modified
			return {left: rect.left, top: rect.top, width: rect.width, height: rect.height};
		} else {
			// figure out the top/left offset
			var rect = this.getBoundingClientRect();
			var leftOffset = this.offsetLeft - rect.left;
			var topOffset = this.offsetTop - rect.top;
			if ('left' in value) this.css('left', value.left + leftOffset);
			if ('top' in value) this.css('top', value.top + topOffset);
			if ('width' in value) this.outerWidth(value.width);
			if ('height' in value) this.outerHeight(value.height);
		}
	}
});


simpli5.map({
	matches: 'every',
	addClass: 'forEach',
	removeClass: 'forEach',
	hasClass: 'some',
	toggleClass: 'forEach',
	attr: 'getterSetter',
	removeAttr: 'forEach',
	css: 'getterSetter',
	make: 'forEach',
	html: 'getterSetter',
	text: 'getterSetter',
	val: 'getterSetter',
	cleanWhitespace: 'forEach',
	after: 'merge',
	append: 'merge',
	before: 'merge',
	prepend: 'merge',
	data: 'getterSetter',
	width: 'getterSetter',
	height: 'getterSetter',
	outerWidth: 'getterSetter',
	outerHeight: 'getterSetter',
	rect: 'getterSetter'
});

})();
/**
 * Bind a function to run in the scope of obj (i.e. "this" will equal obj) 
 * @param obj
 * @param * additional arguments will be added to the call
 */
Function.prototype.bind = function(obj) {
	var method = this, args = [];
	for (var i = 1, l = arguments.length; i < l; i++) {
		args.push(arguments[i]);
	}
	return function() {
		var a = [];
		for (var i = 0, l = arguments.length; i < l; i++) {
			a.push(arguments[i]);
		}
		a = a.concat(args);
		return method.apply(obj, a);
	}
};

// starts calling a function at regular intervals
Function.prototype.start = function(frequency) {
	if (this.timer) return;
	this.timer = setInterval(this, frequency*1000);
	this();
	return this.timer;
};

// stops a function which is currently being called at intervals from .start()
Function.prototype.stop = function() {
	clearInterval(this.timer);
	delete this.timer;
};

// stops a function which is currently being called at intervals from .start()
Function.prototype.running = function() {
	return !!this.timer;
};

// returns a new function which is throttled from being called too frequently
Function.prototype.throttle = function(delay, obj) {
	var method = this;
	var closure = function() {
		if (closure.throttled) {
			closure.pending = true;
			return closure.throttled;
		}
		closure.throttled = setTimeout(function() {
			delete closure.throttled;
			if (closure.pending) {
				delete closure.pending;
				closure.call(delay, obj);
			}
		}, delay);
		return method.apply(obj, arguments);
	}
	return closure;
};/**
 * 
 * @param implementation
 * @param [constructor] private
 */
function Class(implementation, constructor) {
	// create the constructor, init will be the effective constructor
	constructor = constructor || function() {
		if (this.init) return this.init.apply(this, arguments);
	};
	
	if (implementation) {
		
		if (implementation.extend) {
			Class.subclass.prototype = implementation.extend.prototype;
			constructor.prototype = new Class.subclass();
			delete implementation.extend;
		}
		
		if (implementation.implement) {
			var impl = implementation.implement instanceof Array ? implementation.implement : [implementation.implement];
			for (var i = 0, l = impl.length; i < l; i++) {
				Class.implement(constructor, impl);
			}
			delete implementation.implement;
		}
		// Copy the properties over onto the new prototype
		Class.mixin(constructor, implementation);
	}
	constructor.prototype.constructor = constructor;
	constructor.prototype.callSuper = Class.callSuper;
	return constructor;
}

simpli5.extend(Class, {
	subclass: function() {},
	callSuper: function(funcName) {
		var curProto = this.__curProto__ || this.__proto__;
		var proto = curProto.__proto__;
		while (proto && !proto.hasOwnProperty(funcName)) {
			proto = proto.__proto__;
		}
		if (!proto) {
			throw 'There is no super method "' + funcName + '" for ' + this;
		}
		this.__curProto__ = proto;
		var args = simpli5.toArray(arguments).slice(1);
		var func = proto.__lookupSetter__(funcName) || proto[funcName];
		var result = func.apply(this, args);
		this.__curProto__ = curProto;
		return result;
	},
	implement: function(classObj, implClassObj) {
		Class.mixin(classObj, implClassObj.prototype, true);
	},
	mixin: function(classObj, methods, includeInherited) {
		for (var i in methods) {
			if (!includeInherited && !methods.hasOwnProperty(i)) continue;
			
			// handle getters/setters correctly
			var getter = methods.__lookupGetter__(i), setter = methods.__lookupSetter__(i);
			
			if (getter || setter) {
				if (getter) classObj.prototype.__defineGetter__(i, getter);
				if (setter) classObj.prototype.__defineSetter__(i, setter);
			} else {
				classObj.prototype[i] = methods[i];
			}
		}
	},
	make: function(instance, classType, skipInit) {
		instance.__proto__ = classType.prototype;
		var args = simpli5.toArray(arguments);
		args.splice(0, 2);
		if (!skipInit && 'init' in instance) instance.init.apply(instance, args);
	}
});var CustomEvent = new Class({
	extend: Event,
	init: function(type, bubbles, cancelable) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, bubbles || false, cancelable || false);
		Class.make(evt, this.constructor, true);
		return evt;
	}
});

//initMouseEvent( 'type', bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget )
var CustomMouseEvent = new Class({
	extend: MouseEvent,
	init: function(type, bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent(type, bubbles || false, cancelable || false, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
		Class.make(evt, this.constructor, true);
		return evt;
	}
});


var DataEvent = new Class({
	extend: Event,
	init: function(type, data) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, false, false);
		Class.make(evt, this.constructor, true);
		evt.data = data;
		return evt;
	}
});

var PropertyChangeEvent = new Class({
	extend: Event,
	init: function(type, oldValue, newValue) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, false, false);
		Class.make(evt, this.constructor, true);
		evt.oldValue = oldValue;
		evt.newValue = newValue;
		return evt;
	}
});

var EventDispatcher = new Class({
	bind: function(listeners) {
		if ( !(listeners instanceof Array)) {
			listeners = simpli5.toArray(arguments);
		} 
		for (var i = 0, l = listeners.length; i < l; i++) {
			var methodName = listeners[i];
			this[methodName] = this[methodName].bind(this);
		}
	},
	addEventListener: function(type, listener) {
		if (typeof listener != 'function') throw 'Listener must be a function';
		if (!this.events) {
			this.events = {};
		}
		var events = this.events[type];
		if (!events) {
			this.events[type] = events = [];
		} else if (events.indexOf(listener) != -1) {
			return; // already added
		}
		events.push(listener);
	},
	removeEventListener: function(type, listener) {
		if (!this.events) return;
		var events = this.events[type];
		if (!events) return;
		var index = events.indexOf(listener);
		if (index != -1) {
			events.splice(index, 1);
		}
	},
	dispatchEvent: function(event) {
		if (!this.events) return;
		var events = this.events[event.type];
		if (!events) return;
		for (var i = 0, l = events.length; i < l; i++) {
			events[i].call(this, event);
		}
	}
});

simpli5.extend(EventDispatcher.prototype, {
	on: function(type, listener, capture) {
		var types = type.split(/\s*,\s*/);
		listener.bound = listener.bind(this);
		listener = listener.bound;
		for (var i = 0, l = types.length; i < l; i++) {
			this.addEventListener(types[i], listener, capture);
		};
	},
	un: function(type, listener, capture) {
		var types = type.split(/\s*,\s*/);
		listener = listener.bound || listener;
		for (var i = 0, l = types.length; i < l; i++) {
			this.removeEventListener(types[i], listener, capture);
		};
	}
});

simpli5.node.extend({
	on: EventDispatcher.prototype.on,
	un: EventDispatcher.prototype.un
});

simpli5.map({
	on: 'forEach',
	un: 'forEach'
});

var PropertyChange = {
	
	observe: function(obj, property, observer) {
		var props = property.split(/\s*,\s*/);
		var properties = obj.__observers__;
		if (!properties) {
			obj.__observers__ = properties = {};
		}
		
		for (var i = 0, l = props.length; i < l; i++) {
			property = props[i];
			if (!this.isObservable(obj, property)) {
				this.makeObservable(obj, property);
			}
			var observers = properties[property];
			if (!observers) {
				properties[property] = observers = [];
			}
			if (observers.indexOf(observer) == -1) observers.push(observer);
		}
	},
	
	unobserve: function(obj, property, observer) {
		var props = property.split(/\s*,\s*/);
		var properties = obj.__observers__;
		if (!properties) return;
		
		for (var i = 0, l = props.length; i < l; i++) {
			property = props[i];
			var observers = properties[property];
			if (!observers) continue;
			var index = observers.indexOf(observer);
			observers.splice(index, 1);
		}
	},
	
	dispatch: function(obj, property, oldValue, newValue) {
		if (oldValue === newValue) return;
		var properties = obj.__observers__;
		if (!properties) return;
		
		var observers = properties[property];
		if (!observers) return;
		for (var i = 0, l = observers.length; i < l; i++) {
			observers[i](property, oldValue, newValue, obj);
		}
	},
	
	isObservable: function(obj, property) {
		var setter = obj.__lookupSetter__(property);
		if (setter && setter.observable) return true;
		if (!setter || setter.toString().indexOf('PropertyChange.dispatch') == -1) {
			return false;
		} else {
			setter.observable = true;
			return true;
		}
	},
	
	makeObservable: function(obj, property) {
		var getter = obj.__lookupGetter__(property);
		var setter = obj.__lookupSetter__(property);
		
		if (getter && setter) {
			obj.__defineSetter__(property, function(value) {
				var oldValue = getter.call(obj);
				if (oldValue == value) return;
				setter.call(this, value);
				value = getter.call(obj);
				PropertyChange.dispatch(obj, property, oldValue, value);
			});
		} else {
			var prop = obj[property];
			obj.__defineGetter__(property, function() { return prop; });
			obj.__defineSetter__(property, function(value) {
				var oldValue = prop;
				if (oldValue == value) return;
				prop = value;
				PropertyChange.dispatch(obj, property, oldValue, value);
			});
			obj.__lookupSetter__(property).observable = true;
		}
	}
};


var Bind = {
	
	property: function(source, sourceProp, target, targetProp, twoWay) {
		var binding = new Binding(source, sourceProp, target, targetProp, twoWay);
		var bindings = source.__bindings__;
		if (!bindings) {
			source.__bindings__ = bindings = [];
		}
		bindings.push(binding);
		var bindings = target.__bindings__;
		if (!bindings) {
			target.__bindings__ = bindings = [];
		}
		bindings.push(binding);
	},
	
	setter: function(source, sourceProp, setter) {
		var binding = new Binding(source, sourceProp, setter);
		var bindings = source.__bindings__;
		if (!bindings) {
			source.__bindings__ = bindings = [];
		}
		bindings.push(binding);
	},
	
	removeProperty: function(source, sourcePath, target, targetPath, twoWay) {
		var bindings = source.__bindings__;
		var targetBindings = target.__bindings__;
		if (!bindings || !targetBindings) return;
		
		for (var i = 0, l = bindings.length; i < l; i++) {
			var binding = bindings[i];
			if (binding.matches(source, sourcePath, target, targetPath, twoWay)) {
				binding.release();
				bindings.splice(i, 1);
				var index = targetBindings.indexOf(binding);
				if (index != -1) targetBindings.splice(index, 1);
				break;
			}
		}
	},
	
	removeSetter: function(source, sourcePath, setter) {
		var bindings = source.__bindings__;
		if (!bindings) return;
		
		for (var i = 0, l = bindings.length; i < l; i++) {
			var binding = bindings[i];
			if (binding.matches(source, sourcePath, target, targetPath, twoWay)) {
				binding.release();
				bindings.splice(i, 1);
				break;
			}
		}
	},
	
	removeAll: function(target) {
		var bindings = target.__bindings__;
		if (!bindings) return;
		
		for (var i = 0, l = bindings.length; i < l; i++) {
			var binding = bindings[i];
			if (binding.target.length) {
				var target = binding.target.length;
				var index = target.__bindings__.indexOf(binding);
				if (index != -1) target.__bindings__.splice(index, 1);
			}
			binding.release();
		}
		bindings.length = 0;
	}
	
};

var Binding = new Class({
	
	init: function(source, sourcePath, target, targetPath, twoWay) {
		this.onChange = this.onChange.bind(this);
		this.source = [];
		this.target = [];
		this.reset(source, sourcePath, target, targetPath, twoWay);
	},
	
	matches: function(source, sourcePath, target, targetPath, twoWay) {
		if (typeof target == 'function' && targetPath == null) {
			return (this.source[0] == source && this.sourcePath.join('.') == sourcePath && this.setter == target);
		} else {
			return (this.source[0] == source && this.sourcePath.join('.') == sourcePath && this.target[0] == target && this.targetPath.join('.') == targetPath && this.twoWay == twoWay);
		}
	},
	
	release: function() {
		this.unbindPath('source', 0);
		this.unbindPath('target', 0);
		this.setter = null;
		this.sourcePath = null;
		this.targetPath = null;
		this.twoWay = false;
		this.sourceResolved = false;
		this.targetResolved = false;
		this.value = undefined;
	},

	reset: function(source, sourcePath, target, targetPath, twoWay) {
		this.release();
		this.twoWay = twoWay;
		
		if (typeof target == 'function' && targetPath == null) {
			this.setter = target;
			this.targetPath = [];
		} else {
			this.targetPath = targetPath.split('.');
		}
		this.sourcePath = sourcePath.split('.');

		this.bindPath('target', target, 0);
		this.update('source', source, 0);
	},
	
	bindPath: function(base, item, pathIndex) {
		var i, length, path = this[base + 'Path'], property, objs = this[base];
		
		this.unbindPath(base, pathIndex);
		
		for (i = pathIndex, length = path.length; i < length; i++) {
			if (item == null) break;
			objs[i] = item;
			property = path[i];
			if (pathIndex < length - 1 || this.twoWay || base == 'source') {
				PropertyChange.observe(item, property, this.onChange);
			}
			item = item[property];
		}
		this[base + 'Resolved'] = (i == length || item != null);
		return this[base + 'Resolved'] ? item : undefined;
	},
	
	unbindPath: function(base, pathIndex) {
		var path = this[base + 'Path'], objs = this[base], i = objs.length;
		
		while (i-- > pathIndex) {
			PropertyChange.unobserve(objs[i], path[i], this.onChange);
		}
		
		objs.length = pathIndex;
	},
	
	update: function(base, item, pathIndex) {
		pathIndex = pathIndex || 0;
		
		var oldValue = this.value;
		this.value = this.bindPath(base, item, pathIndex);
		
		if (oldValue === this.value) return;
		
		this.updating = true;
		if (this.setter) {
			var target = this.source[this.source.length - 1];
			this.setter.call(target, this.sourcePath[this.sourcePath.length - 1], oldValue, this.value, target);
		}
		
		var otherBase = (base == 'source' ? 'target' : 'source');
		var resolved = this[otherBase + 'Resolved'];
		if (resolved) {
			var otherPath = this[otherBase + 'Path'];
			var otherItem = this[otherBase][otherPath.length - 1];
			if (otherItem) {
				var prop = otherPath[otherPath.length - 1];
				otherItem[prop] = this.value;
			}
		}
		this.updating = false;
	},
	
	onChange: function(property, oldValue, newValue, target) {
		if (this.updating) return;
		var pathIndex, prop;

		if ( (pathIndex = this.source.indexOf(target)) != -1) {
			prop = this.sourcePath[pathIndex];
			if (prop == property) {
				this.update('source', newValue, pathIndex + 1);
				return; // done
			}
		}

		if ( (pathIndex = this.target.indexOf(target)) != -1) {
			prop = this.targetPath[pathIndex];

			if (prop == property) {
				if (this.twoWay) {
					this.update('target', newValue, pathIndex + 1);
				} else {
					this.bindPath('target', newValue, pathIndex + 1);
					if (this.sourceResolved && this.targetResolved) {
						target = this.target[this.targetPath.length - 1];
						prop = this.targetPath[this.targetPath.length - 1];
						target[prop] = this.value;
					}
				}
			}
		}
	}
});
var Template = new Class({
	init: function (html) {
		this.compiled = null;
		if (arguments.length) {
			this.set.apply(this, arguments);
		}
	},
	
    placeholdersExp: /\{([^\{\}]+)\}/g,
	slashesExp: /\\/g,
	fixCarriageExp: /(\r\n|\n)/g,
	escapeSingleExp: /'/g,
	unEscapeSingleExp: /\\'/g,
	tagStartExp: /<\w/g,
	attributeExp: /([-\w]+)="([^"]*\{[^\}]*\}[^"]*)"/g,
	innerContentExp: />([^<]*\{[^\}]*\}[^<]*)</g,
	propExp: /(^|\W)(this|data)\.([\w\.]+)(\()?/g,
	
	replace: function(m, code, index, str, data) {
		return eval('try { ' + code + ' }catch(e) {}') || '';
	},
	
	set: function (html) {
		var compile = false;
		var lines = [];
		for (var i = 0, l = arguments.length; i < l; i++) {
			var param = arguments[i];
			if (param instanceof Array) {
				lines = lines.concat(param);
			} else if (typeof param === 'string') {
				lines.push(param);
			} else if (typeof param === 'boolean') {
				compile = param;
			}
		}
		this.html = lines.join('') || '';
		if (compile) this.compile();
		return this;
	},
	
    apply: function(data) {
		if (this.compiled) return this.compiled(data);
	    var replace = this.replace.bind(this, data);
        return this.html.replace(this.placeholdersExp, replace);
    },
	
	compileReplace: function(match, code) {
		// slashes have been added for all ', remove for code
		return "' + ((" + code.replace(this.unEscapeSingleExp, "'") + ") || '') + '";
	},
	
	compile: function() {
		try {
			var func = "function(data) { return '" +
				this.html.replace(this.slashesExp, '\\\\')
						.replace(this.fixCarriageExp, '\\n')
						.replace(this.escapeSingleExp, "\\'")
						.replace(this.placeholdersExp, this.compileReplace) +
			"'; }";
			this.compiled = eval('(' + func + ')');
		} catch(e) {
			throw 'Error creating template "' + e + '" for template:\n' + this.html;
		}
		return this;
    },
	
	create: function(data) {
		var html = this.apply(data);
		return simpli5.fragment(html).firstChild;
	},
	
	// creates the template binding all {data.*} expressions to the top-level element
	createBound: function(data) {
		var topElement = simpli5.fragment(this.html).firstChild;
		data = data || {};
		
		// if there are no binding expressions, just return the html
		if (!this.html.match(this.placeholdersExp)) return topElement;
		
		var nodes = topElement.find('*');
		nodes.unshift(topElement);
		var nodeIndexes = [];
		while (this.tagStartExp.test(this.html)) {
			nodeIndexes.push(this.tagStartExp.lastIndex - 2); // the start of the tag
		}
		
		// find all the attributes and content {} and set up the bindings
		var match, setter;
		
		// find all attributes that have binding expressions
		while ( (match = this.attributeExp.exec(this.html)) ) {
			var attr = match[1];
			var value = match[2];
			var element = null, index = this.attributeExp.lastIndex;
			for (var i = 0; i < nodeIndexes.length; i++) {
				if (index < nodeIndexes[i]) {
					element = nodes[i - 1];
					break;
				}
			}
			if (!element) element = nodes[nodes.length - 1];
			
			setter = eval("(function() { element.attr('" + attr + "', '" +
				value.replace(this.slashesExp, '\\\\')
						.replace(this.fixCarriageExp, '\\n')
						.replace(this.escapeSingleExp, "\\'")
						.replace(this.placeholdersExp, this.compileReplace) +
			"'); })").bind(topElement);
			
			// pull out binding expressions, there may be more than one
			while ( (match = this.placeholdersExp.exec(value)) ) {
				var code = match[1];
				// find each property that 
				while ( (match = this.propExp.exec(code)) ) {
					if (match[4]) continue; // matched a function, don't bind
					var obj = match[2] == 'this' ? topElement : data;
					var prop = match[3];
					Bind.setter(obj, prop, setter);
				}
			}
			setter();
		}
		
		// find all inner text that have binding expressions
		while ( (match = this.innerContentExp.exec(this.html)) ) {
			var content = match[1];
			var element = null, index = this.innerContentExp.lastIndex;
			for (var i = 0; i < nodeIndexes.length; i++) {
				if (index < nodeIndexes[i]) {
					element = nodes[i - 1];
					break;
				}
			}
			if (!element) element = nodes[nodes.length - 1];
			
			setter = eval("(function() { element.html('" +
				content.replace(this.slashesExp, '\\\\')
						.replace(this.fixCarriageExp, '\\n')
						.replace(this.escapeSingleExp, "\\'")
						.replace(this.placeholdersExp, this.compileReplace) +
			"'); })").bind(topElement);
			
			// pull out binding expressions, there may be more than one
			while ( (match = this.placeholdersExp.exec(content)) ) {
				var code = match[1];
				
				// find each property that 
				while ( (match = this.propExp.exec(code)) ) {
					if (match[4]) continue; // matched a function, don't bind
					var obj = match[2] == 'this' ? topElement : data;
					var prop = match[3];
					Bind.setter(obj, prop, setter);
				}
			}
			setter();
		}
		
		return topElement;
	}
});function Component(implementation) {
	function constructor() {
		var view = this.template.create(null);
		view.__proto__ = this.__proto__;
		if (view.init) {
			view.init.apply(view, arguments);
		}
		return view;
	}
	return new Class(implementation, constructor);
}

var Button = new Component({
	extend: HTMLButtonElement,
	template: new Template('<button></button>'),
	init: function() {
		
	},
	get label() {
		return this.text();
	},
	set label(value) {
		this.text(value);
	}
});

Storage.prototype.get = function(key) {
    return JSON.parse(this.getItem(key));
}

Storage.prototype.set = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

simpli5.extend(Storage, {
	
	get: function(key, defaultValue) {
		if (key in sessionStorage) {
			return JSON.parse(sessionStorage[key]);
		} else if (key in localStorage) {
			return JSON.parse(localStorage[key]);
		} else {
			return defaultValue || false;
		}
	},
	
	set: function(key, value) {
		value = JSON.stringify(value);
		sessionStorage[key] = value;
		localStorage[key] = value;
	}
});