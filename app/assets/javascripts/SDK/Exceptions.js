var Exception = Class.extend({
	init: function(message){
		this.message = message;
	}
});

var GameEngineException = Exception.extend({});
var ApplicationException = Exception.extend({});
var AlreadyReproducingException = Exception.extend({});
var NotMatureException = Exception.extend({});
var NotEnoughEnergyException = Exception.extend({});
var NotReadyToReproduceException = Exception.extend({});
var ArgumentNullException = Exception.extend({});
var TooFastException = Exception.extend({});
var AlreadyFullException = Exception.extend({});
var NotWithinDistanceException = Exception.extend({});
var ImproperFoodException = Exception.extend({});
var InvalidPointsException = Exception.extend({});


