
var Ajax = new Class({
	extend: EventDispatcher,
	
	constructor: function() {
		this.headers = {};
	},
	
	setRequestHeader: function(name, value) {
		this.headers[name] = value;
	},
	
	send: function(method, url, user, password) {
		var xhr = new XMLHttpRequest(), response = new Response();
		response.xhr = xhr;
		
		if (user) {
			xhr.open(method, url, true, user, password);
		} else {
			xhr.open(method, url);
		}
		for (var i in this.headers) {
			if (!this.headers.hasOwnProperty(i)) continue;
			xhr.setRequestHeader(i, this.headers[i]);
		}
		
		var lastIndex = 0, results, ajax = this;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 3) {
				try {
					results = ajax.format(xhr.responseText.substring(lastIndex));
					lastIndex = xhr.responseText.length;
				} catch(e) {}
				ajax.dispatchEvent(new DataEvent('progress', results));
				response.trigger('progress', results);
			} else if (xhr.readyState == 4) {
				try {
					results = ajax.format(xhr.responseText);
				} catch(e) {
					// formating error
					alert(e);
				}
				ajax.dispatchEvent(new DataEvent('complete', results));
				response.trigger('complete', results);
			}
		}
		xhr.send();
		return response;
	},
	
	format: function(data) {
		if (data == '' || data == null) return null;
		else return JSON.parse(data);
	},
	
	get: function() {
		
	},
	
	post: function() {
		
	},
	
	put: function() {
		
	}
//	
//		var xhr = new XMLHttpRequest();
//		xhr.open('get', '/rest/engagement/posts');
//		xhr.setRequestHeader('Accept', 'application/json');
//		xhr.onreadystatechange = function() {
//			if (xhr.readyState != 4) return;
//			document.find('#articles').data = JSON.parse(xhr.responseText);
//		}
//		xhr.send();
});

/**
 * Represents a single service which can be 
 */
var AjaxService = new Component({
	extend: Component,
	register: 'services service',
	properties: ['prefix', 'user', 'password'],
	events: ['progress', 'complete', 'error'],
	
	constructor: function() {
		var ajax = this.ajax = new Ajax(), service = this;
		this.prefix = '';
		
		this.findAll('headers header').forEach(function(header) {
			if (!header.hasAttribute('name') || !header.hasAttribute('value')) return;
			ajax.setRequestHeader(header.getAttribute('name'), header.getAttribute('value'));
		});
		
		this.calls = this.findAll('call').forEach(function(call) {
			call.service = service;
		});
	},
	
	send: function(method, url) {
		return this.ajax.send(method, this.prefix + url, this.user, this.password);
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
		this.handlers = {complete: [], fault: [], progress: []};
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
	
	triggerFault: function(error) {
		this.trigger('fault', error);
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
					result.on('fault', this.triggerFault.boundTo(this));
					return; // pick back up after this response is done
				} else {
					if (result instanceof Error && this.status == 'complete') {
						this.status = 'fault';
						handlers = this.handlers.fault;
					}
					data = result;
				}
			}
		}
	}
});


