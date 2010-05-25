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
