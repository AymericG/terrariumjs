var AnimalMind = OrganismMind.extend({
	init: function(species)
	{
		this._super(species);
	},
	StopMoving: function()
	{
		this.PendingActions.MoveToAction = null;
		this.InProgressActions.MoveToAction = null;
//		this.BeginMoving(new MovementVector(this.State.Position, 2));
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
		switch (messageObject.signal)
		{
			case Signals.MoveCompleted:
				this.PendingActions.MoveToAction = null;
				this.InProgressActions.MoveToAction = null;
				this.OnMoveCompleted();
				break;	
			case Signals.EatCompleted:
				this.PendingActions.EatAction = null;
				this.InProgressActions.EatAction = null;
				this.OnEatCompleted();
				break;
			default:
				this._super(messageObject);

		}
	},

	OnMoveCompleted: function(){}, // Waiting to be overriden.
	OnEatCompleted: function(){}, // Waiting to be overriden.

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
	CurrentEatAction: function(){
		if (this.PendingActions.EatAction != null)
			return this.PendingActions.EatAction;
		if (this.InProgressActions.EatAction != null)
			return (this.InProgressActions.EatAction);
		return null;
	},
	IsEating: function(){
		return this.CurrentEatAction() != null;
	},
	CanEat: function(){
		return this.State.EnergyState() <= EnergyState.Normal;
	},
	WithinEatingRange: function(targetOrganism){
		return this.State.IsAdjacentOrOverlapping(targetOrganism);
    },
    BeginEating: function(targetOrganism)
	{
        if (targetOrganism == null)
            throw new ArgumentNullException("targetOrganism");

        if (this.State.EnergyState() > EnergyState.Normal)
            throw new AlreadyFullException();

        var currentOrganism = targetOrganism;
        if (!this.WithinEatingRange(currentOrganism))
            throw new NotWithinDistanceException();

        // Make sure it is edible
        if (this.State.Species.IsCarnivore)
        {
            if (currentOrganism.IsPlant())
                throw new ImproperFoodException();

            if (currentOrganism.IsAlive())
                throw new NotDeadException();
        }
        else
        {
            if (!currentOrganism.IsPlant())
                throw new ImproperFoodException();
        }
        var action = new EatAction(targetOrganism.Id);
        this.PendingActions.EatAction = action;

        this.WriteTrace("Setting EatAction: " + targetOrganism.Id);
        this.InProgressActions.EatAction = action;
    }

});

