var Template = new Class({
	init: function (html) {
		this.compiled = null;
		if (arguments.length) {
			this.set.apply(this, arguments);
		}
	},
	
    regex: /\{([^\{\}]+)\}/g,
	
	replace: function(m, code, index, str, data) {
		return eval('try { with(data || {}) {' + code + '} }catch(e) {}') || '';
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
        return this.html.replace(this.regex, replace);
    },
	
	compile: function() {
		function fn(m, code){
			// slashes have been added for all ', remove for code
			return "' + (" + code.replace(/\\'/g, '') + ") + '";
		}
		
		try {
			var func = "function(data) { with (data || {}) { return '" +
				this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.regex, fn) +
			"'; }}";
			this.compiled = eval('(' + func + ')');
		} catch(e) {
			throw 'Error creating template "' + e + '" for template:\n' + this.html;
		}
		return this;
    },
	
	create: function(data) {
		var html = this.apply(data);
		return simpli5.fragment(html).firstChild;
	}
});