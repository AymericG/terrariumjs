$(document).ready(function() {

	var species = new Species();
	
//	var canvas = $("#canvas");
//	var ctx = canvas[0].getContext("2d");
	var $canvas = $("#canvas");
	var width = 520;
	var height = 400;
	$canvas.css("width", width + "px");
	$canvas.css("height", height + "px");
	var game = new Game($canvas[0], width, height);
	game.Start();
	game.AddOrganism("js/Animals/Plant.js");

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

	$(window).peerbind("teleport", {
    	peer:  function(e) { 
    		var interGalacticMessage = JSON.parse(e.peerData);
    		console.log(interGalacticMessage.url);
    		console.log(interGalacticMessage.code);
    		game.AddOrganism(interGalacticMessage.url, interGalacticMessage.code);
    	},
    	local: function(e) { 
    		// Nothing.
    	}
	});
	
});
