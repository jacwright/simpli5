
extend(Node.prototype, {
	parent: function(selector) {
		var node = this.parentNode;
		while (node) {
			if (node.matches(selector)) return node;
			node = node.parentNode;
		}
		return null;
	}
});

extend(Element.prototype, {
	find: function(selector) {
		return this.querySelector(selector);
	},
	findAll: function(selector) {
		return new ElementArray(this.querySelectorAll(selector));
	},
	matches: (Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || function(selector) {
		return (document.find(selector).indexOf(this) != -1);
	})
});

HTMLDocument.prototype.find = Element.prototype.find;
HTMLDocument.prototype.findAll = Element.prototype.findAll;

ElementArray.map({
	matches: 'every'
});