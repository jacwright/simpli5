var CustomEvent = new Class({
	extend: Event,
	init: function(type, bubbles, cancelable) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, bubbles || false, cancelable || false);
		Class.convertTo(evt, this.constructor);
		return evt;
	}
});

//initMouseEvent( 'type', bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget )

var DataEvent = new Class({
	extend: Event,
	init: function(type, data) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, false, false);
		Class.convertTo(evt, this.constructor);
		evt.data = data;
		return evt;
	}
});

var PropertyChangeEvent = new Class({
	extend: Event,
	init: function(type, oldValue, newValue) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, false, false);
		Class.convertTo(evt, this.constructor);
		evt.oldValue = oldValue;
		evt.newValue = newValue;
		return evt;
	}
});

var EventDispatcher = new Class({
	init: function() {
		this.events = {};
	},
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
		var events = this.events[type];
		if (!events) {
			this.events[type] = events = [];
		} else if (events.indexOf(listener) != -1) {
			return; // already added
		}
		events.push(listener);
	},
	removeEventListener: function(type, listener) {
		var events = this.events[type];
		if (!events) return;
		var index = events.indexOf(listener);
		if (index != -1) {
			events.splice(index, 1);
		}
	},
	dispatchEvent: function(event) {
		var events = this.events[event.type];
		if (!events) return;
		for (var i = 0, l = events.length; i < l; i++) {
			events[i].call(this, event);
		}
	}
});

$.extend(EventDispatcher.prototype, {
	on: EventDispatcher.prototype.addEventListener,
	un: EventDispatcher.prototype.removeEventListener
});

$.extend(Node.prototype, {
	on: Node.prototype.addEventListener,
	un: Node.prototype.removeEventListener,
	bind: EventDispatcher.prototype.bind
});
