var MovementVector = Class.extend({
	init: function(destination, speed){
		this.Destination = destination;	
		this.Speed = speed;

		if (speed < 2)
			throw new ApplicationException("Speed must be positive and > 1.");
	}
});
