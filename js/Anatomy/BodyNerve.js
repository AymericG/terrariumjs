var BodyNerve = function(organism, mindUrl) {
	var self = this;
	this.Organism = organism;
	this.EventQueue = [];
	this.MindThread = new Worker(mindUrl);
	this.MindThread.onmessage = function(e) { self.Receive(e.data); };

	this.Receive = function(message) {
		var messageObject = JSON.parse(message);
		
		if (messageObject.signal == Signals.Log && messageObject.message != null)
			console.log("[#" + self.Organism.Id + "] " + messageObject.message);
	
		switch(messageObject.signal) {
			case Signals.Initialized:
				this.Organism.InitializeState(messageObject.Species);
				this.Organism.Trigger(Signals.Born, this.Organism);
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
				if (reproduceAction && self.Organism.State.IsAlive())
					self.Organism.InProgressActions.ReproduceAction = new ReproduceAction(reproduceAction.Dna);

				var eatAction = messageObject.actions.EatAction;
				if (eatAction && self.Organism.State.IsAlive())
       				self.Organism.InProgressActions.EatAction = new EatAction(eatAction.TargetOrganismId);

				var attackAction = messageObject.actions.AttackAction;
				if (attackAction && self.Organism.State.IsAlive())
       				self.Organism.InProgressActions.AttackAction = new AttackAction(attackAction.TargetOrganismId);

				var defendAction = messageObject.actions.DefendAction;
				if (defendAction && self.Organism.State.IsAlive())
       				self.Organism.InProgressActions.DefendAction = new DefendAction(defendAction.TargetOrganismId);
				break;
			default:
				//messageObject.progress = 0;
				//organism.events.unshift(messageObject);
				break;
		}
	};
	this.SendEventQueue = function(){
		this.Send({ signal: Signals.Bulk, events: this.EventQueue });
		this.EventQueue = [];
	};
	this.EventsToQueue = [Signals.Attacked, Signals.EatCompleted, Signals.MoveCompleted, Signals.ReproduceCompleted, Signals.AttackCompleted];
	
	this.ShouldQueue = function(eventName){
		for (var i = 0; i < this.EventsToQueue.length; i++)
			if (eventName == this.EventsToQueue[i])
				return true;
		return false;
	};
	this.Send = function(messageObject) {

		if (this.ShouldQueue(messageObject.signal))
		{
			this.EventQueue.push(messageObject);
			return;
		}

		// passing the latest version of the organism state
		if (this.Organism.State)
			messageObject.State = this.Organism.State.Serializable(true);
		messageObject.InProgressActions = this.Organism.InProgressActions;
		var message = JSON.stringify(messageObject);
	
		self.MindThread.postMessage(message);
	};
};