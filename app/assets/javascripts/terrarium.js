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

	var code = $.cookie('code');
	if (code != null) $("#code").val(code);

	var saveCode = function(){ 
		$.cookie('code', editor.getValue());
	};

	  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	    lineNumbers: true,
	    matchBrackets: true,
	    onChange: saveCode
	  });

	var $canvas = $("#canvas");
	var width = 520;
	var height = 440;
	$canvas.css("width", width + "px");
	$canvas.css("height", height + "px");
	var game = new Game($canvas[0], width, height);
	game.Start();

	var addPlant = function(){ $.get("/assets/Animals/Plant.template.txt", function(result){ game.AddOrganism(organismMindCodeLoaderPath, result); }); };
	addPlant();
	
	$("#load-code").click(function(){
		game.AddOrganism(organismMindCodeLoaderPath, editor.getValue());
	});

	$("#load-herbie").click(function(){
		$.get("/assets/Animals/Herbie.template.txt", function(result){ editor.setValue(result); });
	});
	$("#load-carnie").click(function(){
		$.get("/assets/Animals/Carnie.template.txt", function(result){ editor.setValue(result); });
	});

	$("#load-plant").click(addPlant);

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

	var peerCounter = 0;

	$(window).peerbind("who-is-here", {
    	peer:  function(e) { 
    		peerCounter = 0;
    		$(window).peertrigger("i-am-here");
    	},
    	local: function(e) { 
    		// Nothing.
    	}
	});

	$(window).peerbind("i-am-here", {
    	peer:  function(e) { 
    		peerCounter++;
    		$("#terrarium-count").html(peerCounter);
    	},
    	local: function(e) { 
    		peerCounter++;
    		$("#terrarium-count").html(peerCounter);
    	}
	});

	$(window).peertrigger("who-is-here");
	$(window).peertrigger("i-am-here");
});
