var MindNerve = function(organismMind){ // should be called Neuron?
	var self = this;
	this.OrganismMind = organismMind;

	this.Receive = function(message)
	{
		var messageObject = JSON.parse(message);
		
		if (messageObject.State) // State update sent with message
			this.OrganismMind.State.Refresh(messageObject.State);

		if (messageObject.InProgressActions) 
		{
			var inProgressActions = new PendingActions();
			if (messageObject.InProgressActions.MoveToAction)
			{
				var moveTo = messageObject.InProgressActions.MoveToAction;
				var movementVector = new MovementVector(new Point(moveTo.MoveTo.Destination.X, moveTo.MoveTo.Destination.Y), moveTo.MoveTo.Speed);				
				inProgressActions.MoveToAction = new MoveToAction(movementVector);
			}
			if (messageObject.InProgressActions.ReproduceAction)
				inProgressActions.ReproduceAction = new ReproduceAction(messageObject.InProgressActions.ReproduceAction.Dna);

			this.OrganismMind.InProgressActions = inProgressActions;
		}
		this.OrganismMind.ProcessSignal(messageObject);

	};
	
	this.Send = function(messageObject) {		
		var message = JSON.stringify(messageObject);
		postMessage(message);
	};

	onmessage = function(e) { self.Receive(e.data); };
};