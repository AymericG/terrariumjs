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
	var editors = {};
	$(".editor").each(function(){

		var editor = CodeMirror.fromTextArea(document.getElementById(this.id), {
			lineNumbers: true,
			matchBrackets: true,
			onChange: function() { return saveCode(editor); }
		});
		editor.originalId = this.id;

		var code = $.cookie(this.id);
		if (code != null) 
			editor.setValue(code);

		editors[this.id] = editor;
	});

	var $canvas = $("#canvas");
	var width = 720;
	var height = 440;
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
	
	
	$("#load-code").click(function(){

		var code = "";
		for (var editor in editors)
		{
			code += editors[editor].getValue();
		}
		game.AddOrganism(organismMindCodeLoaderPath, code);
	});

	var loadCode = function(path)
	{
		$(".editor").each(function(){
			var editor = this;
			var file = this.id.replace("editor-", "") + ".txt";
			$.get(path + file, function(result){ 
				editors[editor.id].setValue(result); 
			});
		});
	};

	$("#load-herbie").click(function(){
		loadCode("javascripts/Animals/Herbie/");
		$(".step-wrap header")[1].click();
	});
	$("#load-carnie").click(function(){
		loadCode("javascripts/Animals/Carnie/");
		$(".step-wrap header")[1].click();
	});

	$("#load-aggro").click(function(){
		loadCode("javascripts/Animals/Aggro/");
		$(".step-wrap header")[1].click();
	});


	$("#load-plant").click(addPlant);


	var peerCounter = 0;

	$(".step-wrap header").click(function(){
		$(".step").hide();
		$(this).next().show();
		$(".editor").each(function(){
			editors[this.id].refresh();
		});
	});
});
