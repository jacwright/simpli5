/**
 * The stack component holds multiple elements showing only one selected element at a time. It supports selecting by
 * element tag name, element name attribute, element, or index. It also has history support built in for basic tie-in to
 * the browser's history.
 * 
 * Child elements under stack are styled as block elements and can be any tag name. The name attribute can be used to
 * help in element selection.
 * 
 * The HTML version might look like:
 *  
 * <stack>
 *     <any-element name="main">content</any-element>
 *     <any-element name="other">content</any-element>
 * </stack>
 */
var Stack = new Component({
	extend: Component,
	template: new Template('<stack></stack>'),
	events: ['change'],
	properties: ['selected', 'selected-index', 'history-enabled', 'reset-on-page-unknown'],
	register: 'stack',
		
	constructor: function() {
		this.on('DOMNodeInserted', this.onChild.boundTo(this));
		this.on('DOMNodeRemoved', this.onChild.boundTo(this));
		this.getChildren().hide();
		if (!this.selected) this.selected = this.children.length ? this.children[0] : null;
		else this.selected.show(true);
		var frames = this.frames = {};
		
		this.getChildren().forEach(function(child) {
			frames[child.name || child.tagName.toLowerCase()] = child;
		});
	},

	/**
	 * The currently selected element. This should always return an HTMLElement unless there are no children elements in
	 * stack. You may set selected using either the element you want selected, a string representing the desired element
	 * by name or tag name, or a number for the index of the element to be selected. If several of the child elements
	 * have the same tag name, the last one will be selected if you use the tag name. You should use the name attribute
	 * in that situation to find the correct child. 
	 * 
	 * Examples:
	 * <stack>
	 *     <one></one>
	 *     <div name="two"></div>
 	 *     <div name="three"></div>
	 * </stack>
	 * 
	 * stack.selected = 'one'; // selects the first element
	 * stack.selected = 'three'; // selects the last element
	 * stack.selected = 0; // selects the first element
	 * 
	 * This may be set in the selected attribute of the stack.
	 */
	get selected() {
		return this._selected;
	},
	set selected(page) {
		if (typeof page == 'number' || isNumeric(page)) {
			page = this.children[parseFloat(page)];
		} else if (typeof page == 'string') {
			page = this.frames[page];
		} else if (!page.tagName) {
			return;
		}

        if(!page && this._resetOnPageUnknown){
            page = this.children[0];
        }
		
		if (!page || this._selected == page) return;
		
		var event = new ChangeEvent('change', this._selected, page);
		
		if (this._selected) {
			this._selected.hide();
			if (page) page.show(true);
		} else if (page) page.show(true);
		
		this._selected = page;
		
		this.dispatchEvent(event);
	},

	/**
	 * The index of the currently selected element. This may be set in the selected-index attribute.
	 */
	get selectedIndex() {
		return this.getChildren().indexOf(this.selected);
	},
	set selectedIndex(value) {
		this.selected = value;
	},

	/**
	 * Turns simply history tracking on or off for this stack. When history is enabled, the stack uses the url hash to
	 * determine which element should be selected. If an element has a name="foo" then when navigating to
	 * mypage.html#foo will select that element. Add links to your page with href="#element-name" to toggle between the
	 * stack's elements.
	 * 
	 * When no hash is present in the url, the selected element will be the one declared in the selected attribute, the
	 * selected-index attribute, or it will be the first element in the stack.
	 */
	get historyEnabled() {
		return this._historyEnabled;	
	},
	set historyEnabled(value) {
		this._historyEnabled = value;
		if(value) {
			window.on("hashchange", this.onHashChange.boundTo(this));
			this.onHashChange();
		} else {
			window.un("hashchange", this.onHashChange.boundTo(this));
		}
	},

    /**
     * Changes the behavior of setSelected when the provided page is not known.  The default behavior is to do nothing.
     * When "resetOnPageUnknown" is set to true, then the stack will flip to the first element in the stack when
     * encountering an unknown page.  This is useful on pages with 2 stacks where the user typically interacts with
     * only one at a time, and while interacting with one stack, the other should be reverted to the original element.
     */
    get resetOnPageUnknown() {
        return this._resetOnPageUnknown;
    },
    set resetOnPageUnknown(value){
        this._resetOnPageUnknown = value;
    },

	/**
	 * Toggles between selected elements in the stack by index. If the current selectedIndex is 0 then after calling
	 * toggle() the selectedIndex will be 1. If the current selected element is the last element, then toggle will
	 * select the first element in the stack. If there are only two elements in a stack toggle will simply toggle
	 * between the two.
	 */
	toggle: function() {
		if (this.selectedIndex == this.children.length - 1) this.selectedIndex = 0;
		else this.selectedIndex += 1;
	},

	/**
	 * @private
	 */
	onHashChange : function() {
		this.selected = location.hash.substring(1)
				|| this.getAttribute('selected')
				|| this.getAttribute('selected-index')
				|| 0;
	},

	/**
	 * @private
	 */
	onChild: function(event) {
		if (event.relatedTarget != this) return;
		
		var child = event.target;
		
		if (event.type == 'DOMNodeInserted') {
			frames[child.name || child.tagName.toLowerCase()] = child;
			if (!this.selected) this.selected = child;
			else child.hide();
		} else {
			delete frames[child.name || child.tagName.toLowerCase()];
			if (this.selected == child) {
				this.selectedIndex = (this.selectedIndex == this.children.length - 1 ? this.selectedIndex - 1 : this.selectedIndex + 1);
			}
		}
	}
});
