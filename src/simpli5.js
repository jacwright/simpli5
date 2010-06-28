
var simpli5 = (function() {
	
	// PRIVATE MEMBERS
	
	// id for global object ids used with molded.getId()
	var id = 0;
	
	// holds component registrations
	var registry = {};
	
	/**
	 * Sets up everything needed when the document is ready.
	 */
	function onDomLoaded() {
		simpli5.dispatch('domready');
		simpli5.mold(document.body);
		simpli5.dispatch('ready');
	}
	
	
	// molded class, public members
	
	var Simpli5 = new Class({
		extend: EventDispatcher,
		
		/**
		 * Constructor
		 */
		constructor: function() {
			document.addEventListener('DOMContentLoaded', onDomLoaded);
		},
		
		/**
		 * Create and return a unique id for an object. This allows object lookup in object hashmaps.
		 * 
		 * @param obj Object
		 * @return String
		 */
		getId: function(obj) {
			return obj.__simpli5Id || (obj.__simpli5Id = id++);
		},
		
		/**
		 * Registers a selector which will find and convert all elements to the given component type. When a two
		 * selectors match an element the former component will take precedence. When registering a component with the
		 * exact same selector as a previously registered component, the former will be replaced in the registry.
		 * 
		 * @param selector String
		 * @param componentClass Function (Class)
		 */
		register: function(selector, componentClass) {
			registry[selector] = componentClass;
		},

		/**
		 * Unregisters a given selector from converting its elements to a component type.
		 * 
		 * @param selector String
		 */
		unregister: function(selector) {
			delete registry[selector];
		},

		/**
		 * Returns the component type that is registered with a given selector.
		 * 
		 * @param selector
		 */
		getRegistered: function(selector) {
			return registry[selector];
		},
		
		/**
		 * Initialize all the components and set up all the data-bindings.
		 * 
		 * @param element HTMLElement
		 */
		mold: function(element) {
			
			for (var i in registry) {
				element.findAll(i).makeClass(registry[i]);
			}
			
			
			
			
			
		}
	});
	
	
	// return an instance of the molded class
	return new Simpli5();
})();
