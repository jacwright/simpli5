
function forEach(iterable, func) {
	Array.prototype.forEach.call(iterable, func);
}

function toArray(iterable) {
	if (iterable instanceof Array) return iterable;
	var arr = Array.prototype.slice.call(iterable);
	if (!arr.length && iterable != null && !('length' in iterable)) return [iterable];
	return arr;
}

function extend(obj, extension) {
	if (arguments.length == 1) {
		obj = this;
		extension = obj;
	}
	for (var i in extension) {
		var getter = extension.__lookupGetter__(i), setter = extension.__lookupSetter__(i);
		if (getter || setter) {
			if (getter) obj.__defineGetter__(i, getter);
			if (setter) obj.__defineSetter__(i, setter);
		} else {
			obj[i] = extension[i];
		}
	}
}

String.trim = function(str) {
	return str.replace(String.trim.regex, '');
};
String.trim.regex = /^\s+|\s+$/g;

function isNumeric(value) {
	return typeof value == 'number' || (typeof value == 'string' && parseFloat(value).toString() == String.trim(value));
}

var toFragment = (function() {
	var div = document.createElement('div');
	
	function toFragment(html) {
		var frag = document.createDocumentFragment();
		
		if (html instanceof Node) {
			frag.appendChild(html);
		} else if (typeof html == 'string') {
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
	}
	
	return toFragment;
})();


function toElement(html) {
	return toFragment(html).firstChild;
}

/**
 * 
 * @param implementation
 */
function Class(implementation) {
	// create the constructor if not provided
	if (!implementation.hasOwnProperty('constructor')) {
		implementation.constructor = function() {};
	}
	var constructor = implementation.constructor;
	
	if (implementation) {
		if (implementation.extend) {
			Class.subclass.prototype = implementation.extend.prototype;
			constructor.prototype = new Class.subclass();
			delete implementation.extend;
		}
		
		if (implementation.implement) {
			var impl = implementation.implement instanceof Array ? implementation.implement : [implementation.implement];
			for (var i = 0, l = impl.length; i < l; i++) {
				Class.implement(constructor, impl[i]);
			}
			delete implementation.implement;
		}
		// Copy the properties over onto the new prototype
		Class.mixin(constructor, implementation);
	}
	return constructor;
}

extend(Class, {
	subclass: function() {},
	implement: function(classObj, implClassObj) {
		Class.mixin(classObj, implClassObj.prototype);
	},
	mixin: function(classObj, methods) {
		extend(classObj.prototype, methods);
	},
	makeClass: function(instance, classType, skipConstructor) {
		instance.__proto__ = classType.prototype;
		var args = toArray(arguments);
		args.splice(0, 3);
		if (!skipConstructor) classType.apply(instance, args);
	},
	insert: function(instance, classType) {
		var proto = {};
		for (var i in classType.prototype) {
			if (classType.prototype.hasOwnProperty(i)) {
				proto[i] = classType.prototype[i];
			}
		}
		proto.__proto__ = instance.__proto__;
		instance.__proto__ = proto;
	}
});

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
Function.prototype.throttle = function(delay) {
	var method = this;
	var closure = function() {
		if (closure.throttled) {
			closure.pending = arguments;
			return closure.throttled;
		}
		closure.throttled = setTimeout(function() {
			delete closure.throttled;
			if (closure.pending) {
				closure.apply(null, closure.pending);
				delete closure.pending;
			}
		}, delay);
		return method.apply(null, arguments);
	}
	return closure;
};
