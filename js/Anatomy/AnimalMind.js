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
//				this.PendingActions.MoveToAction = null;
//				this.InProgressActions.MoveToAction = null;
				this.OnMoveCompleted();
				break;	
			case Signals.EatCompleted:
//				this.PendingActions.EatAction = null;
//				this.InProgressActions.EatAction = null;
				this.OnEatCompleted();
				break;
			case Signals.Attacked:
				this.OnAttacked(messageObject.AttackerId);
			case Signals.AttackCompleted:
				this.OnAttackCompleted();
			default:
				this._super(messageObject);

		}
	},

	OnAttacked: function(attackerId){}, // Waiting to be overriden.
	OnAttackCompleted: function(){}, // Waiting to be overriden.
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
		var result = this.State.IsAdjacentOrOverlapping(targetOrganism);
		//this.WriteTrace("WithinEatingRange:");
		//this.WriteTrace(this.State.GridX() + " " + this.State.GridY() + this.State.CellRadius());
		//this.WriteTrace(targetOrganism.GridX() + " " + targetOrganism.GridY() + targetOrganism.CellRadius());
		//this.WriteTrace("result -> " + result);
		return result;
    },
    ///   Used to determine if your creature is within range to attack another
    ///   target creature.
    ///   This method does not attempt to validate the position of the
    ///   organismState with respect to the current world state.  If you
    ///   pass a stale object in then you may get stale results.  Make sure
    ///   you use the LookFor method to get the most up-to-date results.
    WithinAttackingRange: function(targetOrganism)
    {
        if (targetOrganism == null)
            throw new ArgumentNullException("targetOrganism");

        return this.State.IsWithinRect(1, targetOrganism);
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

        //this.WriteTrace("Setting EatAction: " + targetOrganism.Id);
        this.InProgressActions.EatAction = action;
    },
    StopAttacking: function(){
		this.PendingActions.AttackAction = null;
		this.InProgressActions.AttackAction = null;
    },
    BeginAttacking: function(targetAnimal){
    	var attackAction = new AttackAction(targetAnimal.Id);
    	this.PendingActions.AttackAction = attackAction;
		this.InProgressActions.AttackAction = attackAction;
    },
    StopDefending: function(){
		this.PendingActions.DefendAction = null;
		this.InProgressActions.DefendAction = null;
    },
    BeginDefending: function(targetAnimal){
    	var defendAction = new DefendAction(targetAnimal.Id);
    	this.PendingActions.DefendAction = defendAction;
		this.InProgressActions.DefendAction = defendAction;
    },
	CurrentDefendAction: function(){
		if (this.PendingActions.DefendAction != null)
			return this.PendingActions.DefendAction;
		if (this.InProgressActions.DefendAction != null)
			return (this.InProgressActions.DefendAction);
		return null;
	},

	CurrentAttackAction: function(){
		if (this.PendingActions.AttackAction != null)
			return this.PendingActions.AttackAction;
		if (this.InProgressActions.AttackAction != null)
			return (this.InProgressActions.AttackAction);
		return null;
	},
	IsAttacking: function(){
		return this.CurrentAttackAction() != null;
	},
	LookFor: function(organismId)
	{
		for (var i = 0; i < this.State.SeenOrganisms.length; i++)
			if (this.State.SeenOrganisms[i].Id == organismId)
				return this.State.SeenOrganisms[i];
		return null;
	}
});

