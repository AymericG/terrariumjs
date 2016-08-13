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

	// Override me!
	OnInit: function(dna){}, 
	OnIdle: function(){},

	ProcessSignal: function(messageObject)
	{
		try
		{
			switch(messageObject.signal) {
				case Signals.Init:
					this.World = messageObject.World;
					this.OnInit(messageObject.Dna);
					// Send back Species.
					this.Nerve.Send({ signal: Signals.Initialized, Species: this.Species });
					break;
				case Signals.Tick:
					this.Tick();
					break;
				case Signals.Bulk:
					for (var i = 0; i < messageObject.events.length; i++)
						this.ProcessSignal(messageObject.events[i]);
					break;
				default:
					// I don't understand
					break;
			}
		}
		catch (e)
		{
			this.Nerve.Send({ signal: "Error", error: e.message });
		}
	},

	// Reproduction related functions
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

	// Show message at the bottom of the screen
	WriteTrace: function(message) {
		this.Nerve.Send({ signal: Signals.Log, message: message });
	},

	// Called each game tick
	Tick: function() {

		// reset pending actions
		this.PendingActions = new PendingActions(); 

		// Main function to be overriden by players		
		this.OnIdle();

		// Main function has run, return results to game.
		this.Nerve.Send({
			signal: Signals.Act, 
			actions: this.PendingActions, 
			leftAntenna: this.State.LeftAntenna, 
			rightAntenna: this.State.RightAntenna });
	},

	IsMySpecies: function(state){
		return state.Species.Name == this.State.Species.Name; // need a better way to detect same species
	}
});
