var OrganismMind = Class.extend({
	init: function(species){
		this.Nerve = new MindNerve(this);
		this.Id = 0;
		this.PendingActions = new PendingActions();
		this.InProgressActions = new PendingActions();
		this.Species = species;
		if (species.IsPlant)
			this.State = new PlantState(species);
		else
			this.State = new AnimalState(species);
	},

	IsReproducing: function(){
		return this.CurrentReproduceAction() != null;
	},

	CurrentReproduceAction: function(){
		if (this.PendingActions.ReproduceAction != null)
			return this.PendingActions.ReproduceAction;
		if (this.InProgressActions.ReproduceAction != null)
			return (this.InProgressActions.ReproduceAction);
		return null;
	},

	CanReproduce: function(){

		return this.State.ReadyToReproduce() && 
	    	!this.IsReproducing() && 
	    	this.State.IsMature() && 
	    	(this.State.EnergyState() >= EnergyState.Normal);
	},
	ProcessSignal: function(messageObject)
	{
		switch(messageObject.signal) {
			case Signals.Born:
				this.World = messageObject.World;
				if (messageObject.Code)
					eval(messageObject.Code);

				// Send back Species.
				this.Nerve.Send({ signal: Signals.Ready, Species: this.Species });

				break;
			case Signals.Tick:
				this.Tick();
				break;
			default:
				// I don't understand
				break;
		}
	},
	log: function(message) {
		this.Nerve.Send({ signal: Signals.Log, message: message });
	},
	
	Tick: function() {
		this.OnIdle();

		// Main function has run, return results to game.
		this.Nerve.Send({ signal: Signals.Act, actions: this.PendingActions});
	},

	BeginReproduction: function (dna)
	{
		if (this.IsReproducing())
		    throw new AlreadyReproducingException();

		if (!this.State.IsMature())
		    throw new NotMatureException();

		if (this.State.EnergyState() < EnergyState.Normal)
		    throw new NotEnoughEnergyException();

		if (!this.State.ReadyToReproduce())
		    throw new NotReadyToReproduceException();

		var action = new ReproduceAction(dna);
		this.PendingActions.ReproduceAction = action;
	    this.InProgressActions.ReproduceAction = action;
	},

	OnIdle: function(){ }
});
