var Exception = Class.extend({
	init: function(message){
		this.Message = message;
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
