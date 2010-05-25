
var HoverMenu = new Component({
	extend: HTMLUListElement,
	template: new Template('<ul class="HoverMenu">{this.items}</ul>'),
	
	init: function() {
		this.items = [];
		
	}
});

var HoverSubMenu = new Component({
	extend: HTMLLIElement,
	template: new Template('<li class="HoverSubMenu">{this.label}<ul>{this.items}</ul></li>'),
	
	init: function() {
		
	}
});

var HoverMenuItem = new Component({
	extend: HTMLLIElement,
	template: new Template('<li class="HoverMenuItem">{this.label}</li>'),
	
	init: function() {
		
	}
});