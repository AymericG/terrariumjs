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
			this.Nerve.Send({ signal: "Error", error: e });
		}
	},
	OnInit: function(dna){}, // Waiting to be overriden.
	WriteTrace: function(message) {
		this.Nerve.Send({ signal: Signals.Log, message: message });
	},
	IsFunction: function (functionToCheck) {
	 var getType = {};
	 return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
	},
	Tick: function() {

		//this.WriteTrace("max: " + this.IsFunction(this.State.Species.MaximumEnergyPerUnitRadius));
		this.PendingActions = new PendingActions();
		this.OnIdle();

		// Main function has run, return results to game.
		//this.WriteTrace("EatActio:" + this.PendingActions.EatAction);
		this.Nerve.Send({
			signal: Signals.Act, 
			actions: this.PendingActions, 
			leftAntenna: this.State.LeftAntenna, 
			rightAntenna: this.State.RightAntenna });
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
