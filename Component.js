function Component(implementation) {
	function constructor(data) { // the data object for an itemRenderer
		var view = this.template.createBound(data);
		view.__proto__ = this.__proto__;
		if ( !(view instanceof HTMLElement)) throw 'Components must extend HTMLElement or a subclass.';
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