var BodyNerve = function(organism, mindUrl) {
	var self = this;
	this.Organism = organism;
	this.MindThread = new Worker(mindUrl);
	this.MindThread.onmessage = function(e) { self.Receive(e.data); };

	this.Receive = function(message) {
		var messageObject = JSON.parse(message);
		
		if (messageObject.signal == Signals.Log && messageObject.message != null)
			console.log("[LOG] " + self.Organism.Id + ": " + messageObject.message);
	
		switch(messageObject.signal) {
			case Signals.Ready:
				this.Organism.InitializeState(messageObject.Species);
				this.Organism.Trigger(Signals.Ready, this.Organism);
				break;

			case Signals.Act: 
				var moveTo = messageObject.actions.MoveToAction;
				if (moveTo)
				{
					var movementVector = new MovementVector(new Point(moveTo.MoveTo.Destination.X, moveTo.MoveTo.Destination.Y), moveTo.MoveTo.Speed);				
					if (self.Organism.State.IsAlive())
						self.Organism.InProgressActions.MoveToAction = new MoveToAction(movementVector);
				}

				var reproduceAction = messageObject.actions.ReproduceAction;
				if (reproduceAction)
				{
					if (self.Organism.State.IsAlive()) 
						self.Organism.InProgressActions.ReproduceAction = new ReproduceAction(reproduceAction.Dna);
				}
				break;
			default:
				//messageObject.progress = 0;
				//organism.events.unshift(messageObject);
				break;
		}
	};

	this.Send = function(messageObject) {
		// passing the latest version of the organism state
		messageObject.State = this.Organism.State; 

		messageObject.InProgressActions = this.Organism.InProgressActions;
		var message = JSON.stringify(messageObject);
		self.MindThread.postMessage(message);
	};
};