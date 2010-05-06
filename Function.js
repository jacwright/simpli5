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
};