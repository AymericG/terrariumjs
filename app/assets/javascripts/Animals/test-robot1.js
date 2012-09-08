importScripts('Organism.js');
var organism = new Organism();
onmessage = function(e) { organism.Receive(e.data); };


TestBot1 = Organism;

TestBot1.run = function() {
	var robot = this;

 	robot.shoot();
	robot.turn_left(5, function() {
		robot._run();
	});
	/*

	robot.move_forward(360);
	robot.turn_left(180, function() {
		robot.turn_right(90, function() {
			robot._run();
		});
	});
	*/

	// robot._run();
		/*
	robot.turn_left(parseInt(Math.random()*360));
	robot.move_forward(parseInt(Math.random()*300), function() {
		robot.turn_right(parseInt(Math.random()*360), function() {
			robot._run();
		});
		*/
	// });
}
