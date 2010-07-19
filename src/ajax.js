
var Ajax = new Class({
	extend: EventDispatcher,
	
	constructor: function() {
		this.headers = {};
	},
	
	setRequestHeader: function(name, value) {
		this.headers[name] = value;
	},
	
	send: function(method, url, callback, error) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url);
		for (var i in this.headers) {
			if (!this.headers.hasOwnProperty(i)) continue;
			xhr.setRequestHeader(i, this.headers[i]);
		}
		var lastIndex = 0, results;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 3) {
				if (this.hasEventListener('progress')) {
					try {
						results = this.format(xhr.responseText.substring(lastIndex));
						lastIndex = xhr.responseText.length;
						this.dispatchEvent(new DataEvent('progress', results));
					} catch(e) {}
				}
			} else if (xhr.readyState == 4) {
				if (this.hasEventListener('complete')) {
					try {
						results = this.format(xhr.responseText);
						this.dispatchEvent(new DataEvent('complete', results));
					} catch(e) {
						// formating error
					}
				}
			}
		}
		xhr.send();
		return xhr;
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
	properties: ['method', 'url', 'autoTrigger'],
	events: ['progress', 'complete', 'error'],
	
	constructor: function() {
		this.calls = this.findAll('call').forEach(function(call) {
			call.service = this;
		});
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
		Ajax.send(this.method, this.url).onComplete(this.complete);
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
