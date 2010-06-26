function Component(implementation) {
	// call the constructor inside our custom constructor
	var constructor = implementation.constructor;
	
	implementation.constructor = function(data) { // the data object for an itemRenderer
		var view = this.template.createBound(data);
		view.__proto__ = this.__proto__;
		if ( !(view instanceof HTMLElement)) throw 'Components must extend HTMLElement or a subclass.';
		if (constructor) {
			constructor.apply(view, arguments);
		}
		return view;
	}
	
	return new Class(implementation);
}

var Button = new Component({
	extend: HTMLButtonElement,
	template: new Template('<button></button>'),
	constructor: function() {
		
	},
	get label() {
		return this.text();
	},
	set label(value) {
		this.text(value);
	}
});
