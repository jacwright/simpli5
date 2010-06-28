//
//<div class="TreeMenu">
//	<ul>
//		<li><span class="top-elbow" style="margin-left: -40px"><span class="open"></span></span><span class="item"><span class="icon elbow" style="margin-left: -20px"><img src="js/simpli5/images/folder.png" alt=""/></span><span class="label">My Label</span></span>
//			<ul class="line">
//				<li><span class="elbow" style="margin-left: -40px"><span class="open"></span></span><span class="icon elbow" style="margin-left: -20px"><img src="js/simpli5/images/folder.png" alt=""/></span><span class="label">My Label which is really long and needs to be truncated</span>
//					<ul>
//						<li><span class="elbow" style="margin-left: -40px"><span class="open"></span></span><span class="icon elbow" style="margin-left: -20px"><img src="js/simpli5/images/folder.png" alt=""/></span><span class="label">My Label</span>
//							<ul>
//								<li><span class="elbow" style="margin-left: -40px"><span class="open"></span></span><span class="icon elbow" style="margin-left: -20px"><img src="js/simpli5/images/folder.png" alt=""/></span><span class="label">My Label</span>
//									<ul>
//										<li><span class="elbow" style="margin-left: -40px"><span class="open"></span></span><span class="icon line" style="margin-left: -20px"><img src="js/simpli5/images/folder.png" alt=""/></span><span class="label">My Label</span></li>
//									</ul>
//								</li>
//							</ul>
//						</li>
//					</ul>
//				</li>
//			</ul>
//		</li>
//		<li><span class="tee" style="margin-left: -40px"><span class="closed"></span></span><span class="icon line" style="margin-left: -20px"><img src="js/simpli5/images/folder.png" alt=""/></span><span class="label">My Label</span></li>
//		<li><span class="elbow" style="margin-left: -40px"></span><span class="icon line" style="margin-left: -20px"><img src="js/simpli5/images/page.png" alt=""/></span><span class="label">My Label</span></li>
//	</ul>
//</div>


var TreeMenu = new Component({
	extend: HTMLDivElement,
	template: new Template('<div class="TreeMenu"><ul>{this.children}</ul></div>'),
	
	init: function(data) {
		this.createClosures('onChildrenChange', 'onDataChange');
		this.children = [];
		Bind.setter(this, 'data', this.onDataChange);
		Bind.setter(this, 'menu', this.onMenuChange);
		this.data = data;
	}
});

var TreeMenuRow = new Component({
	extend: HTMLUListElement,
	template: new Template('<li>',
			'<img class="opener" src="{FileMenu.getIcon(\'blank\')}" width="16" height="16" />',
			'<span class="label">{this.label}</span><ul class="{}">{this.children}</ul>',
		'</li>'),
	
	init: function() {
		
	}
});

var TreeMenuColumn = new Component({
	extend: HTMLElement,
	template: new Template('<span class="{this.type}"></span>'),
	
	init: function() {
		
	}
});

var TreeMenuToggle = new Component({
	extend: TreeMenuColumn,
	template: new Template('<span class="{this.state}"></span>'),
	
	init: function() {
		this.state = '';
	}
});

var TreeMenuItem = new Component({
	extend: HTMLElement,
	template: new Template('<span class="item">{this.icon}{this.label}</span>'),
	
	init: function() {
		this.icon = new TreeMenuIcon();
		this.label = new TreeMenuLabel();
	}
});

var TreeMenuIcon = new Component({
	extend: TreeMenuColumn,
	template: new Template('<span class="icon {this.type}"><img src="{this.icon}" draggable="false" alt=""/></span>'),
	
	init: function() {
		
	}
});

var TreeMenuLabel = new Component({
	extend: TreeMenuColumn,
	template: new Template('<span class="label">{this.label}</span>'),
	
	init: function() {
		
	}
});

//var TreeMenuNode = new Component({
//	
//	template: new Template('<span class="label">',
//			'<img class="fm_icon" src="' + FileMenu.getIcon('folder') + '" width="16" height="16" />',
//			'<span class="fm_text"></span>',
//		'</span>'),
//	// TODO prevent icon from being dragged
//	onclick: function(e) {
//		e = Event.getEventObject(e);
//		e.preventDefault();
//	},
//	
//	onmousedown: function(e) {
//		e = Event.getEventObject(e);
//		e.preventDefault();
//		if (e.which == Key.MOUSE_LEFT)
//			this.item.click(e.target == this.item.text);
//	},
//	
//	ondblclick: function(e) {
//		e = Event.getEventObject(e);
//		e.preventDefault();
//		this.item.dblclick();
//	}
//};
//
//var TreeMenu = new Component({
//	extend: HTMLUListElement,
//	template: new Template('<ul>{this.root}</ul>'),
//	
//	init: function() {
//		
//	}
//});
