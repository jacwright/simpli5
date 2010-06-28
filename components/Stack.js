
var Stack = new Component({
	extend: Component,
	template: new Template('<stack></stack>'),
	events: ['change'],
	properties: ['selected', 'selectedIndex'],
	register: 'stack',
	
	constructor: function() {
		this.on('DOMNodeInserted', this, this.onChild);
		this.getChildren().hide();
		if (!this.selected) this.selected = this.children.length ? this.children[0] : null;
		else this.selected.show();
	},
	
	get selected() {
		return this._selected;
	},
	
	set selected(page) {
		if (typeof page == 'number' || isNumeric(page)) {
			page = this.children[parseFloat(page)];
		} else if (typeof page == 'string') {
			page = this.getChildren('[name=' + page + ']').pop() || this.find('*');
		}
		
		if (this._selected == page) return;
		
		var event = new PageChangeEvent('change', this._selected, page);
		
		if (this._selected) this._selected.hide();
		this._selected = page;
		if (page) page.show();
		
		this.dispatchEvent(event);
	},
	
	get selectedIndex() {
		return this.getChildren().indexOf(this.selected);
	},
	
	set selectedIndex(value) {
		this.selected = value;
	},
	
	onChild: function(event) {
		if (event.relatedTarget != this) return;
		
		var page = event.target;
		
		if (!this.selected) this.selected = page;
		else page.hide();
	}
});

var PageChangeEvent = new Class({
	extend: CustomEvent,
	
	constructor: function(type, oldPage, newPage) {
		var evt = CustomEvent.call(this, 'change');
		evt.oldPage = oldPage;
		evt.newPage = newPage;
		return evt;
	}
});
