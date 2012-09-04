importScripts('Organism.js');
var organism = new Organism();
onmessage = function(e) { organism.Receive(e.data); };


SittingDuckBot = Organism;

SittingDuckBot.run = function() {
	var robot = this;

	robot.turn_left(20, function() {
		robot._run();
	});
}
