var Logger = Class.extend({
	init: function(){
		this.Channels = {};
		this.Channels.General = [];
		this.MaxMessages = 100;
		this.CurrentChannelName = "General";
		var self = this;
		console.log = function(message){ self.Log("General", message); };

		$(window).bind("log", function (event, channelName, message)
		{
			self.Log(channelName, message);
		});

		$(window).bind("log-channel", function (event, channelName)
		{
			self.CreateChannelIfNeeded(channelName);		
			self.CurrentChannelName = channelName;
			$(window).trigger("logs-updated", [self, channelName]);
		});
	},
	CreateChannelIfNeeded: function(channelName)
	{
		var channel = this.Channels[channelName];
		if (!channel)
			this.Channels[channelName] = [];
	},
	Log: function(channelName, message)
	{
		this.CreateChannelIfNeeded(channelName);		
		var channel = this.Channels[channelName];
		channel.push(message);
		if (channel.length > this.MaxMessages)
			channel.splice(0, 1);
		$(window).trigger("logs-updated", [this, channelName]);
	}
});
