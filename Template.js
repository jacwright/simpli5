var Template = new Class({
	init: function (html) {
		this.compiled = null;
		if (arguments.length) {
			this.set.apply(this, arguments);
		}
	},
	
    placeholdersExp: /\{([^\{\}]+)\}/g,
	slashesExp: /\\/g,
	fixCarriageExp: /(\r\n|\n)/g,
	escapeSingleExp: /'/g,
	unEscapeSingleExp: /\\'/g,
	tagStartExp: /<\w/g,
	attributeExp: /([-\w]+)="([^"]*\{[^\}]*\}[^"]*)"/g,
	innerContentExp: />([^<]*\{[^\}]*\}[^<]*)</g,
	propExp: /(^|\W)(this|data)\.([\w\.]+)(\()?/g,
	
	replace: function(m, code, index, str, data) {
		return eval('try { ' + code + ' }catch(e) {}') || '';
	},
	
	set: function (html) {
		var compile = false;
		var lines = [];
		for (var i = 0, l = arguments.length; i < l; i++) {
			var param = arguments[i];
			if (param instanceof Array) {
				lines = lines.concat(param);
			} else if (typeof param === 'string') {
				lines.push(param);
			} else if (typeof param === 'boolean') {
				compile = param;
			}
		}
		this.html = lines.join('') || '';
		if (compile) this.compile();
		return this;
	},
	
    apply: function(data) {
		if (this.compiled) return this.compiled(data);
	    var replace = this.replace.bind(this, data);
        return this.html.replace(this.placeholdersExp, replace);
    },
	
	compileReplace: function(match, code) {
		// slashes have been added for all ', remove for code
		return "' + ((" + code.replace(this.unEscapeSingleExp, "'") + ") || '') + '";
	},
	
	compile: function() {
		try {
			var func = "function(data) { return '" +
				this.html.replace(this.slashesExp, '\\\\')
						.replace(this.fixCarriageExp, '\\n')
						.replace(this.escapeSingleExp, "\\'")
						.replace(this.placeholdersExp, this.compileReplace) +
			"'; }";
			this.compiled = eval('(' + func + ')');
		} catch(e) {
			throw 'Error creating template "' + e + '" for template:\n' + this.html;
		}
		return this;
    },
	
	create: function(data) {
		var html = this.apply(data);
		return simpli5.fragment(html).firstChild;
	},
	
	// creates the template binding all {data.*} expressions to the top-level element
	createBound: function(data) {
		var topElement = simpli5.fragment(this.html).firstChild;
		data = data || {};
		
		// if there are no binding expressions, just return the html
		if (!this.html.match(this.placeholdersExp)) return topElement;
		
		var nodes = topElement.find('*');
		nodes.unshift(topElement);
		var nodeIndexes = [];
		while (this.tagStartExp.test(this.html)) {
			nodeIndexes.push(this.tagStartExp.lastIndex - 2); // the start of the tag
		}
		
		// find all the attributes and content {} and set up the bindings
		var match, setter;
		
		// find all attributes that have binding expressions
		while ( (match = this.attributeExp.exec(this.html)) ) {
			var attr = match[1];
			var value = match[2];
			var element = null, index = this.attributeExp.lastIndex;
			for (var i = 0; i < nodeIndexes.length; i++) {
				if (index < nodeIndexes[i]) {
					element = nodes[i - 1];
					break;
				}
			}
			if (!element) element = nodes[nodes.length - 1];
			
			setter = eval("(function() { element.attr('" + attr + "', '" +
				value.replace(this.slashesExp, '\\\\')
						.replace(this.fixCarriageExp, '\\n')
						.replace(this.escapeSingleExp, "\\'")
						.replace(this.placeholdersExp, this.compileReplace) +
			"'); })").bind(topElement);
			
			// pull out binding expressions, there may be more than one
			while ( (match = this.placeholdersExp.exec(value)) ) {
				var code = match[1];
				// find each property that 
				while ( (match = this.propExp.exec(code)) ) {
					if (match[4]) continue; // matched a function, don't bind
					var obj = match[2] == 'this' ? topElement : data;
					var prop = match[3];
					Bind.setter(obj, prop, setter);
				}
			}
			setter();
		}
		
		// find all inner text that have binding expressions
		while ( (match = this.innerContentExp.exec(this.html)) ) {
			var content = match[1];
			var element = null, index = this.innerContentExp.lastIndex;
			for (var i = 0; i < nodeIndexes.length; i++) {
				if (index < nodeIndexes[i]) {
					element = nodes[i - 1];
					break;
				}
			}
			if (!element) element = nodes[nodes.length - 1];
			
			setter = eval("(function() { element.html('" +
				content.replace(this.slashesExp, '\\\\')
						.replace(this.fixCarriageExp, '\\n')
						.replace(this.escapeSingleExp, "\\'")
						.replace(this.placeholdersExp, this.compileReplace) +
			"'); })").bind(topElement);
			
			// pull out binding expressions, there may be more than one
			while ( (match = this.placeholdersExp.exec(content)) ) {
				var code = match[1];
				
				// find each property that 
				while ( (match = this.propExp.exec(code)) ) {
					if (match[4]) continue; // matched a function, don't bind
					var obj = match[2] == 'this' ? topElement : data;
					var prop = match[3];
					Bind.setter(obj, prop, setter);
				}
			}
			setter();
		}
		
		return topElement;
	}
});