
var HoverMenu = new Component({
	extend: HTMLUListElement,
	template: new Template('<div class="HoverMenu"><ul>{this.items}</ul></div>'),
	
	init: function() {
		this.items = [];
		
	}
});

var HoverMenuItem = new Component({
	extend: HTMLLIElement,
	template: new Template('<li class="HoverMenuItem">{this.label}{this.submenu}</li>'),
	
	init: function() {
		
	}
});

var HoverSubMenu = new Component({
	extend: HTMLLIElement,
	template: new Template('<ul class="HoverSubMenu">{this.items}</ul>'),
	
	init: function() {
		
	}
});