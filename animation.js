var Animation = {
	
	tweens: [],
	
	now: function() {
		return (new Date()).getTime();
	},
	
	update: function() {
		
		
		if (!this.tweens.length) {
			this.run.stop();
			return;
		}
		
	}.bind(Animation)
}

var Tween = new Class({
	
});