
var HoverMenu = new Component({
	extend: Component,
	template: new Template('<hover-menu>{this.submenu}</hover-menu>'),
	properties: ['click-only'],
	register: 'hover-menu',
	
	constructor: function() {
		this.clickOnly = false;
		this.createClosures('close', 'onKeyDown');
		this.submenu = this.find('menu') || new HoverSubMenu();
		this.submenu.menu = this;
		this.submenu.hide();
		this.on('click', this.onClick);
	},
	
	onKeyDown: function(event) {
		if (event.keyCode == 27) this.close(); //esc
	},
	
	onClick: function(event) {
		event.stopPropagation();
		if (!this.opened) this.open();
	},
	
	get clickOnly() {
		return this._clickOnly;
	},
	
	set clickOnly(value) {
		if (this._clickOnly == value) return;
		this._clickOnly = value;
		value ? this.un('rollover', this.open) : this.on('rollover', this.open);
		value ? this.un('rollout', this.onRollout) : this.on('rollout', this.onRollout);
	},
	
	get opened() {
		this.submenu.visible();
	},
	
	open: function() {
		if (HoverMenu.openMenu == this) {
			clearTimeout(this.rolloutTimeout);
		} else if (HoverMenu.openMenu) {
			HoverMenu.openMenu.close();
		}
		HoverMenu.openMenu = this;
		this.openSubmenu();
		document.on('keydown', this.onKeyDown);
		document.on('click', this.close);
		window.on('resize', this.close);
	},
	
	close: function() {
		this.submenu.hide();
		this.submenu.items.forEach(function(item) {
			item.close();
		});
		document.un('keydown', this.onKeyDown);
		document.un('click', this.close);
		HoverMenu.openMenu = null;
	},
	
	openSubmenu: function() {
		this.submenu.show();
		var rect = this.rect();
		var menuRect = this.submenu.rect();
		var left = rect.right - 2;
		var top = rect.top - 4;
		if (left + menuRect.width >= window.innerWidth) {
			left = rect.left - menuRect.width + 2;
			this.submenu.addClass('left');
		} else {
			this.submenu.removeClass('left');
		}
		if (top + menuRect.height >= window.innerHeight) {
			top = rect.bottom - menuRect.height + 4;
			this.submenu.addClass('up');
		} else {
			this.submenu.removeClass('up');
		}
		this.addClass('open');
		this.submenu.rect({left: left, top: top});
		this.parentNode.hoveredItem = this;
	},
	
	onRollout: function() {
		var menu = this;
		this.rolloutTimeout = setTimeout(function() {
			menu.close();
		}, 400);
	}
});

var HoverSubMenu = new Component({
	extend: Component,
	template: new Template('<menu>{this.items}</menu>'),
	register: 'hover-menu menu',
	
	constructor: function() {
		this.createClosures('onChildrenChange', 'onDataChange');
		this.items = [];
		Bind.setter(this, 'data', this.onDataChange);
		Bind.setter(this, 'menu', this.onMenuChange);
	},
	
	show: function() {
		var submenu = this;
		submenu.css('display', '');
		setTimeout(function() {
			submenu.css('opacity', 1);
		}, 1);
	},
	
	hide: function() {
		var submenu = this;
		submenu.css('opacity', 0);
		setTimeout(function() {
			submenu.css('display', 'none');
		}, 100);
	},
	
	onMenuChange: function() {
		var submenu = this;
		this.items.forEach(function(item) {
			item.menu = submenu.menu;
		});
	},
	
	onDataChange: function(prop, old, value) {
		if (old) old.un('change', this.onChildrenChange);
		if (value && value instanceof Array) {
			if ( !(value instanceof BindableArray)) Class.makeClass(value, BindableArray);
			value.on('change', this.onChildrenChange);
			
			if (this.items) {
				this.items.forEach(function(item) {
					item.menu = null; // release memory
				});
			}
			
			var submenu = this;
			this.items = value.map(function(data) {
				var item = new HoverMenuItem(data);
				item.menu = submenu.menu;
				return item;
			});
		}
	},
	
	onChildrenChange: function(event) {
		if (event) {
			var submenu = this;
			switch(event.action) {
				case 'add':
					var elements = event.items.map(function(data) {
						var item = new HoverMenuItem(data);
						item.menu = submenu.menu;
						return item;
					});
					this.items.splice.apply(this.items, [event.startIndex, 0].concat(elements));
					break;
				case 'remove':
					this.items.splice(event.startIndex, event.endIndex - event.startIndex);
					break;
			}
		}
		PropertyChange.dispatch(this, 'items', this.items, this.items, true);
	}
});

var HoverMenuItem = new Component({
	extend: Component,
	template: new Template('<menu-item>{this.label}{this.submenu}</menu-item>'),
	register: 'hover-menu menu-item',
	
	constructor: function(data) {
		this._disabled = false;
		this.createClosures('onChildrenChange', 'hovering', 'close');
		this.on('click', this.select);
		this.on('rollover', this.hovered);
		this.on('rollout', this.unhovered);
		Bind.property(this, 'data.label', this, 'label');
		Bind.property(this, 'data.disabled', this, 'disabled');
		Bind.property(this, 'data.children', this, 'submenu.data');
		Bind.property(this, 'menu', this, 'submenu.menu');
		Bind.setter(this, 'data.children', this.onChildrenChange);
		this.data = data;
		
		if (data == null) {
			this.addClass('separator');
			this.disabled = true;
		}
	},
	
	onChildrenChange: function(prop, old, value) {
		if (!old && value) {
			this.submenu = new HoverSubMenu();
			this.submenu.hide();
			this.addClass('submenu');
		} else if (value && !old) {
			this.submenu.menu = null;
			this.submenu = null;
			this.removeClass('submenu');
		}
	},
	
	get disabled() {
		return this._disabled;
	},
	
	set disabled(value) {
		if (this._disabled == value) return;
		this._disabled = value;
		value ? this.addClass('disabled') : this.removeClass('disabled');
	},
	
	select: function() {
		if (this.disabled || this.submenu) return;
		if ('select' in this.data) {
			this.data.select();
		}
		this.menu.close();
	},
	
	hovered: function() {
		if (this.disabled) return;
		this.hoverTimeout = setTimeout(this.hovering, 150);
	},
	
	unhovered: function() {
		clearTimeout(this.hoverTimeout);
	},
	
	hovering: function() {
		if (this.parentNode.hoveredItem && this.parentNode.hoveredItem != this) {
			this.parentNode.hoveredItem.close();
		}
		
		if (this.submenu) {
			this.openSubmenu();
		}
	},
	
	openSubmenu: HoverMenu.prototype.openSubmenu,
	
	close: function() {
		clearTimeout(this.hoverTimeout);
		
		if (this.submenu) {
			this.submenu.items.forEach(function(item) {
				item.close();
			});
			this.submenu.hide();
			this.removeClass('open');
			this.parentNode.hoveredItem = null;
		}
	}
});