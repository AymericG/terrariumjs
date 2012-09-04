$(document).ready(function() {

//	var canvas = $("#canvas");
//	var ctx = canvas[0].getContext("2d");
	var $canvas = $("#canvas");
	var width = 800;
	var height = 400;
	$canvas.css("width", width + "px");
	$canvas.css("height", height + "px");
	var game = new Game($canvas[0], width, height);

	//console.log = function(){};
		
//	BattleManager.init(ctx, ["js/scan-bot.js"]);
//	BattleManager.init(ctx, ["js/test-robot1.js", "js/test-robot2.js", "js/test-robot1.js", "js/test-robot2.js","js/test-robot1.js", "js/test-robot2.js", "js/test-robot1.js", "js/test-robot2.js"]);
	//game.AddRobotsFromUrls(["js/scan-bot.js", "js/scan-bot.js", "js/scan-bot.js", "js/scan-bot.js"]);
	//game.AddRobotsFromString("Robot.run = function() { var robot = this; this.turn_left(20, function() { this._run(); }); };");
	

	$("#load-code").click(function(){
		game.AddOrganismFromCode($("#code").val());
	});

	$("#load-scan-bot").click(function(){
		game.AddOrganism("js/Animals/WanderingGhost.js");
	});

	$("#load-plant").click(function(){
		game.AddOrganism("js/Animals/Plant.js");
	});


	$("#run").click(function(){
		game.Start();
	});
	
});
