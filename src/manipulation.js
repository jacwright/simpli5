extend(HTMLElement.prototype, {
	cleanWhitespace: function() {
		var node = this.firstChild;
		while (node) {
			var curNode = node;
			node = node.nextSibling;
			if (curNode.nodeType == 3) {
				this.removeChild(curNode);
			}
		}
	},
	after: function(html) {
		var frag = toFragment(html);
		var nodes = toArray(frag.childeNodes);
		this.parentNode.insertBefore(frag, this.nextSibling);
		return nodes;
	},
	append: function(html) {
		if (!html || (html.hasOwnProperty('length') && !html.length)) return;
		var frag = toFragment(html);
		var nodes = new ElementArray(frag.childNodes);
		this.appendChild(frag);
		return nodes;
	},
	before: function(html) {
		var frag = toFragment(html);
		var nodes = toArray(frag.childeNodes);
		this.parentNode.insertBefore(frag, this);
		return nodes;
	},
	prepend: function(html) {
		var frag = toFragment(html);
		var nodes = toArray(frag.childeNodes);
		this.insertBefore(frag, this.firstChild);
		return nodes;
	}
});


ElementArray.map({
	cleanWhitespace: 'forEach',
	after: 'merge',
	append: 'merge',
	before: 'merge',
	prepend: 'merge'
});