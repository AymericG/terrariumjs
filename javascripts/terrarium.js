$(document).ready(function() {
	
	$(window).bind("logs-updated", function(event, logger, channelName){
		if (logger.CurrentChannelName == channelName)
		{
			$("#channel-name strong").text(channelName);
			$("#logs").html('');
			var currentChannel = logger.Channels[logger.CurrentChannelName];
			if (currentChannel.length == 0){
				$("#logs").prepend("<li><i>No message yet.</i></li>");				
			}
			else
			{
				for (var i = 0; i < currentChannel.length; i++)
					$("#logs").prepend("<li>" + currentChannel[i] +"</li>");
			}
		}
	});

	var saveCode = function(editor){ 
		$.cookie(editor.originalId, editor.getValue());
	};

	var editorId = "editor";
	var editor = CodeMirror.fromTextArea(document.getElementById(editorId), {
		lineNumbers: true,
		matchBrackets: true,
		onChange: function() { return saveCode(editor); }
	});
	editor.originalId = editorId;

	var code = $.cookie(editorId);
	if (code != null) {
		editor.setValue(code);
	}

	var $canvas = $("#canvas");
	var width = 1024;
	var height = 1024;
	$canvas.css("width", width + "px");
	$canvas.css("height", height + "px");
	var game = new Game($canvas[0], width, height);
	game.Start();

	// Adding a few plants
	var plantCounter = 0;
	window.addPlant = function(){ 
		$.get("javascripts/Animals/Plant.txt", function(result){ 
			game.AddOrganism(organismMindCodeLoaderPath, result);
			plantCounter++;
			if (plantCounter >= 10)
				return;
			setTimeout("window.addPlant()", 500);
		});
	};
	window.addPlant(); 

	$("#load-herbie").click(function(){
		$.get("javascripts/Animals/Herbie.txt", function(result){ 
			game.AddOrganism(organismMindCodeLoaderPath, result);
		});
	});

	$("#load-carnie").click(function(){
		$.get("javascripts/Animals/Carnie.txt", function(result){ 
			game.AddOrganism(organismMindCodeLoaderPath, result);
		});
	});
	
	
	$("#load-code").click(function(){
		var code = editor.getValue();
		game.AddOrganism(organismMindCodeLoaderPath, code);
	});

	$("#toggle-grid").click(function(){
		game.Renderer.ShowGrid = !game.Renderer.ShowGrid;
	});

	$("#toggle-squares").click(function(){
		game.Renderer.ShowOrganismSquares = !game.Renderer.ShowOrganismSquares;
	});

	$(".tab-nav li").click(function(){
		$(".tab-nav li").removeClass("selected");
		$(".tab").removeClass("visible");
		var idSelector = $(this).attr("data-target");
		$(idSelector).addClass("visible");
		$(this).addClass("selected");
	});

	var loadCode = function(path)
	{
		$.get(path, function(result){ 
			editor.setValue(result); 
		});
	};

	$("#load-herbie").click(function(){
		loadCode("javascripts/Animals/Herbie.txt");
	});
	$("#load-carnie").click(function(){
		loadCode("javascripts/Animals/Carnie.txt");
	});

	$("#load-aggro").click(function(){
		loadCode("javascripts/Animals/Aggro.txt");
	});


	$("#load-plant").click(addPlant);


	var peerCounter = 0;

	$(".step-wrap header").click(function(){
		$(".step").hide();
		$(this).next().show();
		editor.refresh();
	});
});
