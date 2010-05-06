function Component(implementation) {
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
