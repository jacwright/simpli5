/**
 * 
 * @param implementation
 * @param [constructor] private
 */
function Class(implementation, constructor) {
	// create the constructor, init will be the effective constructor
	constructor = constructor || function() {
		if (this.init) return this.init.apply(this, arguments);
	};
	
	if (implementation) {
		
		if (implementation.extend) {
			Class.subclass.prototype = implementation.extend.prototype;
			constructor.prototype = new Class.subclass();
			delete implementation.extend;
		}
		
		if (implementation.implement) {
			var impl = implementation.implement instanceof Array ? implementation.implement : [implementation.implement];
			for (var i = 0, l = impl.length; i < l; i++) {
				Class.implement(constructor, impl[i]);
			}
			delete implementation.implement;
		}
		// Copy the properties over onto the new prototype
		Class.mixin(constructor, implementation);
	}
	constructor.prototype.constructor = constructor;
	return constructor;
}

extend(Class, {
	subclass: function() {},
	implement: function(classObj, implClassObj) {
		Class.mixin(classObj, implClassObj.prototype, true);
	},
	mixin: function(classObj, methods, excludeInherited) {
		extend(classObj.prototype, methods, excludeInherited);
	},
	make: function(instance, classType, skipInit) {
		instance.__proto__ = classType.prototype;
		var args = toArray(arguments);
		args.splice(0, 3);
		if (!skipInit && 'init' in instance) instance.init.apply(instance, args);
	},
	insert: function(instance, classType) {
		var proto = {};
		for (var i in classType.prototype) {
			if (classType.prototype.hasOwnProperty(i)) {
				proto[i] = classType.prototype[i];
			}
		}
		proto.__proto__ = instance.__proto__;
		instance.__proto__ = proto;
	}
});