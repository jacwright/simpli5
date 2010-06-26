var ElementArray = new Class({
	extend: Array,
	
	init: function(selector) {
		if (!selector) {
			return;
		} else if (selector.nodeType) {
			this.push(selector);
		} else if (typeof selector === "string") {
			this.merge(this.context.querySelectorAll(selector));
		} else {
			this.merge(selector);
		}
	},
	
	concat: function(args) {
		return Class.make(Array.prototype.concat.apply(this, arguments), ElementArray);
	},
	filter: function(func, thisObj) {
		return Class.make(Array.prototype.filter.call(this, func, thisObj), ElementArray);
	},
	map: function(func, thisObj) {
		return Class.make(Array.prototype.map.call(this, func, thisObj), ElementArray);
	},
	slice: function(start, end) {
		return Class.make(Array.prototype.slice.call(this, start, end), ElementArray);
	},
	splice: function(startIndex, howMany, args) {
		return Class.make(Array.prototype.splice.apply(this, arguments), ElementArray);
	},
	
	extend: function(extension) {
		for (var i in extension) {
			this[i] = extension[i];
		}
	},
	
	merge: function(elems) {
		if (elems == null) return;
		if ( !(elems instanceof Array) && ('length' in elems)) {
			elems = toArray(elems);
		} else {
			elems = [elems];
		}
		this.push.apply(this, elems);
	},
	
	toString: function() {
		return 'ElementArray: [' + this.join(',') + ']';
	}
});

extend(ElementArray, {
	
	map: function(mapping) {
		var map = ElementArray.map, elementArray = ElementArray.prototype, element = HTMLElement.prototype, node = Node.prototype;
		for (var i in mapping) {
			var type = mapping[i];
			elementArray[i] = map[type](element[i] || node[i]);
		}
	}
});


extend(ElementArray.map, {
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