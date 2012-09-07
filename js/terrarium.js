$(document).ready(function() {

	var species = new Species();
	
//	var canvas = $("#canvas");
//	var ctx = canvas[0].getContext("2d");
	var $canvas = $("#canvas");
	var width = 160;
	var height = 80;
	$canvas.css("width", width + "px");
	$canvas.css("height", height + "px");
	var game = new Game($canvas[0], width, height);

	//console.log = function(){};

	$("#load-code").click(function(){
		game.AddOrganismFromCode($("#code").val());
	});

	$("#load-ghost").click(function(){
		game.AddOrganism("js/Animals/WanderingGhost.js");
	});
	$("#load-herbie").click(function(){
		game.AddOrganism("js/Animals/Herbie.js");
	});
	$("#load-carnie").click(function(){
		game.AddOrganism("js/Animals/Carnie.js");
	});

	$("#load-plant").click(function(){
		game.AddOrganism("js/Animals/Plant.js");
	});


	$("#run").click(function(){
		game.Start();
	});
	
});
