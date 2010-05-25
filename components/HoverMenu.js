
var HoverMenu = new Component({
	extend: HTMLUListElement,
	template: new Template('<ul></ul>'),
	
	init: function() {
		
	}
});

var HoverMenuItem = new Component({
	extend: HTMLLIElement,
	template: new Template('<li class="{this.icon}">{this.label}</li>'),
	
	init: function() {
		
	}
});