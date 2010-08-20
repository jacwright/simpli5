
var Ajax = new Class({
	extend: Function,
	
	defaults: {
		method: 'get',
		async: true,
		prefix: '',
		headers: {},
		format: function(data) { return data; }
	},
	
	constructor: function() {
		this.defaults = extend({}, this.defaults); // copy defaults for local alteration
		if (this.defaults.headers) {
			this.defaults.headers = extend({}, this.defaults.headers);
		}
	},
	
	get: function(url, data) {
		return this.send({
			method: 'get',
			url: url,
			data: data
		});
	},
	
	post: function(url, data) {
		return this.send({
			method: 'post',
			url: url,
			data: data
		});
	},
	
	put: function(url, data) {
		return this.send({
			method: 'put',
			url: url,
			data: data
		});
	},
	
	del: function(url) {
		return this.send({
			method: 'delete',
			url: url,
			data: data
		});
	},
	
	send: function(options) {
		// perhaps we should implement a deep copy
		if (options.headers && this.defaults.headers) {
			extend(options.headers, this.defaults.headers, false);
		}
		extend(options, this.defaults, false);
		
		var xhr = new XMLHttpRequest(), response = new Response();
		response.xhr = xhr;
		
		if (options.data && options.method.toLowerCase() == 'get') {
			var append = [];
			var appender = options.url.indexOf('?') == -1 ? '?' : '&';
			for (var i in options.data) {
				if (options.data.hasOwnProperty(i))
					append.push(encodeURIComponent(i) + '=' + encodeURIComponent(options.data[i]));
			}
			options.url += appender + append.join('&');
			delete options.data;
		}
		
		if (options.prefix && !/\w+:\/\//.test(options.url)) {
			options.url = options.prefix + options.url;
		}
		
		if (options.user) {
			xhr.open(options.method, options.url, options.async, options.user, options.password);
		} else {
			xhr.open(options.method, options.url, options.async);
		}
		
		if (options.headers) {
			for (var i in options.headers) {
				if (!options.headers.hasOwnProperty(i)) continue;
				if (i.toLowerCase() == 'content-type' && !options.data) continue;
				xhr.setRequestHeader(i, options.headers[i]);
			}
		}
		
		if (options.progress) response.on('progress', options.progress);
		if (options.complete) response.on('complete', options.complete);
		if (options.error) response.on('error', options.error);
		
		var lastIndex = 0, results;
		xhr.onprogress = function(e) {
			try {
				results = options.format(xhr.responseText.substring(lastIndex), xhr);
				lastIndex = xhr.responseText.length;
			} catch(e) {}
			response.trigger('progress', results);
		};
		
		xhr.onerror = function(e) {
			response.trigger('error', xhr);
		};
		
		xhr.onload = function(e) {
			try {
				results = options.format(xhr.responseText, xhr);
			} catch(e) {
				// formating error
				alert(e);
			}
			response.trigger('complete', results);
		};
		
		if (options.data) {
			xhr.send(options.data);
		} else {
			xhr.send();
		}
		
		return response;
	},
	
	jsonFormat: function(data) {
		if (data == '' || data == null) return null;
		else return JSON.parse(data);
	}
});

Class.makeClass(Ajax, Ajax, true); // make Ajax a singleton instance of itself 

/**
 * Represents a single service which can be 
 */
var AjaxService = new Component({
	extend: Component,
	register: 'services service',
	properties: ['url-prefix', 'user', 'password'],
	events: ['progress', 'complete', 'error'],
	
	constructor: function(connection) {
		this.connection = connection || Ajax;
		var service = this;
		var headers = this.headers = {};
		this.urlPrefix = '';
		
		this.findAll('headers header').forEach(function(header) {
			if (!header.hasAttribute('name') || !header.hasAttribute('value')) return;
			headers[header.getAttribute('name')] = header.getAttribute('value');
		});
		
		this.calls = this.findAll('call').forEach(function(call) {
			call.service = service;
			if (call.hasAttribute('name')) service[call.getAttribute('name')] = call;
		});
	},
	
	send: function(method, url) {
		return this.connection.send({
			method: method,
			url: this.urlPrefix + url,
			format: this.format,
			headers: this.headers,
			user: this.user,
			password: this.password
		});
	},
	
	format: function(data) {
		if (data == '' || data == null) return null;
		else return JSON.parse(data);
	}
});

var AjaxCall = new Component({
	extend: Component,
	register: 'services service call',
	properties: ['method', 'url', 'auto-trigger'],
	events: ['progress', 'complete', 'error'],
	
	constructor: function() {
		this.css('display', 'none');
		this.autoTrigger = false;
		this.url = '';
		this.method = 'get';
	},
	
	get autoTrigger() {
		return this._autoTrigger || false;
	},
	set autoTrigger(value) {
		if (this._autoTrigger == value) return;
		this._autoTrigger = value;
		
		clearInterval(this._autoTriggerInterval);
		
		if (value === false) return;
		
		this.trigger();
		if (value === true || isNaN(value *= 1000)) return; // that's all
		
		this._autoTriggerInterval = setInterval(this.trigger.boundTo(this), value);
	},
	
	trigger: function(params) {
		if (params) {
			if ( !(params instanceof Array) ) params = [params];
			for (var i = 0; i < params.length; i++) {
				var url = this.url, param = params[i];
				for (var prop in param) url = url.replace(':' + prop, param[prop]);
				var response = this.service.send(this.method, url).on('complete', this.complete.boundTo(this));
				if (params.length == 1) return response;
			}
		} else {
			return this.service.send(this.method, this.url).on('complete', this.complete.boundTo(this));
		}
	},
	
	progress: function(data) {
		this.dispatchEvent(new DataEvent('progress', data));
	},
	
	complete: function(data) {
		this.data = data;
		this.dispatchEvent(new DataEvent('complete', data));
	},
	
	error: function(status, data) {
		this.dispatchEvent(new ErrorEvent('error', status, data));
	}
});

var Response = new Class({
	
	constructor: function() {
		this.status = 'progress';
		this.handlers = {complete: [], error: [], progress: []};
	},
	
	on: function(type, handler) {
		if (!this.handlers.hasOwnProperty(type)) return;
		var params = toArray(arguments).slice(1);
		this.handlers[type].push(params);
		return this;
	},
	
	un: function(type, handler) {
		if (!this.handlers.hasOwnProperty(type)) {
			return;
		}
		var handlers = this.handlers[type];
		for (var i = 0; i < handlers.length; i++) {
			if (handler == handlers[i][0]) {
				handlers.splice(i--, 1);
			}
		}
		return this;
	},
	
	triggerComplete: function(data) {
		return this.trigger('complete', data);
	},
	
	triggerError: function(error) {
		return this.trigger('error', error);
	},
	
	trigger: function(type, data) {
		if (!this.handlers.hasOwnProperty(type)) return;
		this.status = type;
		var handlers = this.handlers[type];
		
		while (handlers.length) {
			var params = handlers.shift();
			var handler = params[0];
			params[0] = data;
			var result = handler.apply(data, params);
			if (result !== undefined) {
				if (result instanceof Response) {
					result.on('complete', this.triggerComplete.boundTo(this));
					result.on('error', this.triggerError.boundTo(this));
					return; // pick back up after this response is done
				} else {
					if (result instanceof Error && this.status == 'complete') {
						this.status = 'error';
						handlers = this.handlers.error;
					}
					data = result;
				}
			}
		}
		return this;
	}
});

var AjaxError = new Class({
	extend: Error,
	
	constructor: function(msg, status) {
		this.name = 'AjaxError';
		this.message = msg;
		this.status = status;
	},
	
	toString: function() {
		return 'AjaxError: ' + this.status + ' - ' + this.message;
	}
});
