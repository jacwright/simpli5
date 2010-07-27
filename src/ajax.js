
var Ajax = {
	defaults: {
		method: 'get',
		async: true,
		format: function(data) { return data; }
	},
	
	send: function(options) {
		extend(options, Ajax.defaults);
		
		var xhr = new XMLHttpRequest(), response = new Response();
		response.xhr = xhr;
		
		if (options.user) {
			xhr.open(options.method, options.url, options.async, options.user, options.password);
		} else {
			xhr.open(options.method, options.url, options.async);
		}
		
		if (options.headers) {
			for (var i in options.headers) {
				if (!options.headers.hasOwnProperty(i)) continue;
				xhr.setRequestHeader(i, options.headers[i]);
			}
		}

		if (options.progress) response.on('progress', options.complete);
		if (options.complete) response.on('complete', options.complete);
		if (options.error) response.on('error', options.error);
		
		var lastIndex = 0, results;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 3) {
				try {
					results = options.format(xhr.responseText.substring(lastIndex));
					lastIndex = xhr.responseText.length;
				} catch(e) {}
				response.trigger('progress', results);
			} else if (xhr.readyState == 4) {
				try {
					results = options.format(xhr.responseText);
				} catch(e) {
					// formating error
					alert(e);
				}
				response.trigger('complete', results);
			}
		}
		xhr.send();
		return response;
	}
};

/**
 * Represents a single service which can be 
 */
var AjaxService = new Component({
	extend: Component,
	register: 'services service',
	properties: ['prefix', 'user', 'password'],
	events: ['progress', 'complete', 'error'],
	
	constructor: function() {
		var ajax = this.ajax = new AjaxEndpoint(), service = this;
		this.headers = {};
		this.prefix = '';
		
		this.findAll('headers header').forEach(function(header) {
			if (!header.hasAttribute('name') || !header.hasAttribute('value')) return;
			this.headers[header.getAttribute('name')] = header.getAttribute('value');
		});
		
		this.calls = this.findAll('call').forEach(function(call) {
			call.service = service;
		});
	},
	
	send: function(method, url) {
		return Ajax.send({
			method: method,
			url: this.prefix + url,
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
	properties: ['method', 'url', 'autoTrigger'],
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
	
	trigger: function() {
		this.service.send(this.method, this.url).on('complete', this.complete.boundTo(this));
	},
	
	progress: function(data) {
		this.dispatchEvent(new DataEvent('progress', data));
	},
	
	complete: function(data) {
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
	},
	
	triggerComplete: function(data) {
		this.trigger('complete', data);
	},
	
	triggerError: function(error) {
		this.trigger('error', error);
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
	}
});


