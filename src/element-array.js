var ElementArray = new Class({
	extend: Array,
	
	constructor: function(selector) {
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
		return Class.makeClass(Array.prototype.concat.apply(this, arguments), ElementArray);
	},
	filter: function(func, thisObj) {
		return Class.makeClass(Array.prototype.filter.call(this, func, thisObj), ElementArray);
	},
	map: function(func, thisObj) {
		return Class.makeClass(Array.prototype.map.call(this, func, thisObj), ElementArray);
	},
	slice: function(start, end) {
		return Class.makeClass(Array.prototype.slice.call(this, start, end), ElementArray);
	},
	splice: function(startIndex, howMany, args) {
		return Class.makeClass(Array.prototype.splice.apply(this, arguments), ElementArray);
	},

	/**
	 * Merges an Element, Array of Elements, or NodeList of Elements into this ElementArray.
	 * 
	 * @param elems NodeList|Array|Element
	 */
	merge: function(elems) {
		if (elems == null) return;
		if ( !(elems instanceof Array) && ('length' in elems)) {
			elems = toArray(elems);
		} else {
			elems = [elems];
		}
		this.push.apply(this, elems);
	},

	/**
	 * Returns a new ElementArray which will be a subset of this ElementArray filtered by selector.
	 * 
	 * @param selector String
	 */
	filterBy: function(selector) {
		// TODO benchmark this method vs using document.findAll(selector) and indexOf(element)
		return this.filter(function(element) {
			return element.matches(selector);
		});
	},
	
	toString: function() {
		return 'ElementArray: [' + this.join(',') + ']';
	}
});

extend(ElementArray, {

	/**
	 * Static method adds a mapping function to ElementArray which runs through the list of elements and calls the
	 * corresponding method on the element, then handles the results using the map method specified. This is only a
	 * helper to avoid repetative or redundant functions which are all the same except for the method they are mapping
	 * to. Using map is not required to add functionality to ElementArray.
	 * 
	 * Map methods:
	 * some: returns true if ANY of the elements return true for that method.
	 * every: returns true if ALL of the elements return true for that method.
	 * forEach: runs the method on each element and returns a reference to itself (the ElementArray).
	 * merge: returns a new ElementArray with the merged results of each element method call.
	 * getterSetter: if 1 parameter is passed (a name) returns the value of the getter of the first element, if 2
	 *               parameters are passed (name, value) will set the value on the setters of each element.
	 * returnFirst: calls the method on the first element and returns its result.
	 * 
	 * Example:
	 * <code>
	 * // remove an element from the document
	 * HTMLElement.prototype.destroy = function() {
	 *     this.parentNode.removeChild(this);
	 * }
	 * 
	 * // remove all elements in array from the document
	 * ElementArray.map({ destroy: 'forEach' });
	 * </code>
	 * 
	 * @param mapping Object A hash of method names and mapping methods for ElementArray to map the results in the
	 * correct manner.
	 */
	map: function(mapping) {
		var map = ElementArray.map, elementArray = ElementArray.prototype, element = HTMLElement.prototype;
		for (var i in mapping) {
			var type = mapping[i];
			if (!map.hasOwnProperty(type)) continue;
			elementArray[i] = map[type](element[i]);
		}
	}
});

// mapping methods create a new function that calls the given function on every element in the ElementArray.
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
			var results = new ElementArray();
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