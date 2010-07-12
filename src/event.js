
var CustomEvent = new Class({
	extend: Event,
	constructor: function(type, bubbles, cancelable) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, bubbles || false, cancelable || false);
		Class.makeClass(evt, this.constructor, true);
		return evt;
	}
});

//initMouseEvent( 'type', bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget )
var CustomMouseEvent = new Class({
	extend: MouseEvent,
	constructor: function(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent(type, bubbles || false, cancelable || false, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
		Class.makeClass(evt, this.constructor, true);
		return evt;
	}
});

// initMutationEvent( 'type', bubbles, cancelable, relatedNode, (string) prevValue, (string) newValue, (string) attrName, (short) attrChange )
var CustomMutationEvent = new Class({
	extend: MutationEvent,
	constructor: function(type, bubbles, cancelable, relatedNode, prevValue, newValue, attrName, attrChange) {
		var evt = document.createEvent('MutationEvents');
		evt.initMutationEvent(type, bubbles || false, cancelable || false, relatedNode, prevValue, newValue, attrName, attrChange);
		Class.makeClass(evt, this.constructor, true);
		return evt;
	}
});


var DataEvent = new Class({
	extend: Event,
	constructor: function(type, data) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, false, false);
		Class.makeClass(evt, this.constructor, true);
		evt.data = data;
		return evt;
	}
});

var ArrayChangeEvent = new Class({
	extend: Event,
	constructor: function(action, startIndex, endIndex, items) {
		var evt = document.createEvent('Events');
		evt.initEvent('change', false, false);
		Class.makeClass(evt, this.constructor, true);
		evt.action = action;
		evt.startIndex = startIndex;
		evt.endIndex = endIndex;
		evt.items = items;
		return evt;
	}
});

var EventDispatcher = new Class({
	createClosures: function(listeners) {
		if ( !(listeners instanceof Array)) {
			if (arguments.length == 1 && typeof listeners == 'string' && listeners.indexOf(',') != -1) {
				listeners = listeners.split(/\s*,\s*/);
			} else {
				listeners = toArray(arguments);
			}
		} 
		for (var i = 0, l = listeners.length; i < l; i++) {
			var methodName = listeners[i];
			if (methodName in this) this[methodName] = this[methodName].bind(this);
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
	on: function(type, bound, listener) {
		var types = type.split(/\s*,\s*/);
		if (!listener) {
			listener = bound;
			bound = this;
		}
		
		listener = listener.boundTo(this);
		
		for (var i = 0, l = types.length; i < l; i++) {
			this.addEventListener(types[i], listener, false);
		};
		return this;
	},
	un: function(type, bound, listener) {
		var types = type.split(/\s*,\s*/);
		if (!listener) {
			listener = bound;
			bound = this;
		}
		
		var objId = simpli5.getId(bound);
		listener = listener.__boundTo ? listener.__boundTo[objId] || listener : listener;
		
		for (var i = 0, l = types.length; i < l; i++) {
			this.removeEventListener(types[i], listener, false);
		};
		return this;
	},
	dispatchEvent: function(event) {
		if (!this.events) return;
		var events = this.events[event.type];
		if (!events) return;
		for (var i = 0, l = events.length; i < l; i++) {
			events[i].call(this, event);
		}
	},
	dispatch: function(eventType) {
		if (!this.events || !this.events[eventType] || !this.events[eventType].length) return;
		
		this.dispatchEvent(new CustomEvent(eventType));
	}
});

extend(Node.prototype, {
	on: EventDispatcher.prototype.on,
	un: EventDispatcher.prototype.un,
	createClosures: EventDispatcher.prototype.createClosures
});
extend(window, {
	on: EventDispatcher.prototype.on,
	un: EventDispatcher.prototype.un
});

ElementArray.map({
	on: 'forEach',
	un: 'forEach'
});


/**
 * Setup rollover/rollout events which components use often
 */
(function() {
	
	function listener(event) {
		var child = event.relatedTarget;
		var ancestor = event.target;
		// cancel if the relatedTarget is a child of the target
		while (child) {
			if (child.parentNode == ancestor) return;
			child = child.parentNode;
		}
		
		// dispatch for the child and each parentNode except the common ancestor
		ancestor = event.target.parentNode;
		var ancestors = [];
		while (ancestor) {
			ancestors.push(ancestor);
			ancestor = ancestor.parentNode;
		}
		ancestor = event.relatedTarget;
		while (ancestor) {
			if (ancestors.indexOf(ancestor) != -1) break;
			ancestor = ancestor.parentNode;
		}
		child = event.target;
		while (child) {
			var mouseEvent = document.createEvent('MouseEvents');
			mouseEvent.initEvent(event.type.replace('mouse', 'roll'),
					false, // does not bubble
					event.cancelable,
					event.view,
					event.detail, event.screenX, event.screenY,
					event.ctrlKey, event.altKey, event.metaKey, event.button,
					event.relatedTarget);
			child.dispatchEvent(mouseEvent);
			child = child.parentNode;
			if (child == ancestor) break;
		}
	}
	
	// setup the rollover/out events for components to use
	document.addEventListener('mouseover', listener, false);
	document.addEventListener('mouseout', listener, false);
})();
