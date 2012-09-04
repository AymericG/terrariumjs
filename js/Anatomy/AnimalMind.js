var AnimalMind = OrganismMind.extend({
	init: function(species)
	{
		this._super(species);
	},
	StopMoving: function()
	{
		this.PendingActions.MoveToAction = null;
		this.InProgressActions.MoveToAction = null;
	},

	BeginMoving: function(vector){
		if (vector == null)
		    throw new ArgumentNullException("The argument 'vector' cannot be null");

		if (vector.Speed > this.Species.MaximumSpeed)
		    throw new TooFastException();

		if (vector.Destination.X > this.World.WorldWidth - 1 ||
		    vector.Destination.X < 0 ||
		    vector.Destination.Y > this.World.WorldHeight - 1 ||
		    vector.Destination.Y < 0)
		    throw new OutOfBoundsException();

		var action = new MoveToAction(vector);
		this.PendingActions.MoveToAction = action;
		this.InProgressActions.MoveToAction = action;
	},

	ProcessSignal: function(messageObject)
	{
		if (messageObject.signal == Signals.MoveCompleted)
			this.OnMoveCompleted();
		else
			this._super(messageObject);
	},

	OnMoveCompleted: function(){}, // Waiting to be overriden.

	IsMoving: function(){
		return this.CurrentMoveToAction() != null;
	},

	CurrentMoveToAction: function(){
		if (this.PendingActions.MoveToAction != null)
			return this.PendingActions.MoveToAction;
		if (this.InProgressActions.MoveToAction != null)
			return (this.InProgressActions.MoveToAction);
		return null;
	},
	CanEat: function(){
		return this.State.EnergyState() <= EnergyState.Normal;
	},
	WithinEatingRange: function(targetOrganism){
		return this.State.IsAdjacentOrOverlapping(targetOrganism);
    }
});

