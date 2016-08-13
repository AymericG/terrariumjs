me.OnIdle = function() {

	if (this.TargetPlant != null) 
    {
        // See if our target plant still exists (it may have died)
        // LookFor returns null if it isn't found
        this.TargetPlant = this.LookFor(this.TargetPlant.Id);
    }

	// Our Creature will reproduce as often as possible so
	// every turn it checks CanReproduce to know when it
	// is capable.  If so we call BeginReproduction with
	// a null Dna parameter to being reproduction.
	if (this.CanReproduce())
	{
		this.WriteTrace("Reproducing...");	
		this.BeginReproduction(null);
	}
	// Check to see if we are capable of eating
	// If we are then try to eat or find food,
	// else we'll just stop moving.
	if (this.CanEat() && !this.IsEating())
	{
		// If we have a Target Plant we can try
		// to either eat it, or move towards it.
		// else we'll move to a random vector
		// in search of a plant.
		if (this.TargetPlant != null)
		{
			// If we are within range start eating
			// and stop moving.  Else we'll try
			// to move towards the plant.
			if (this.WithinEatingRange(this.TargetPlant)) 
            {
            	this.WriteTrace("Eating...");	
			
                this.BeginEating(this.TargetPlant);
                if (this.IsMoving()) 
                    this.StopMoving();
            }
            else 
            {
                if (!this.IsMoving()) 
                    this.BeginMoving(new MovementVector(this.TargetPlant.Position, 2));
            }
		}
		else
		{
			// We'll try try to find a target plant
			// If we don't find one we'll move to 
			// a random vector
			if(!this.ScanForTargetPlant()) 
			{
			    if(!this.IsMoving()) 
					this.MoveToRandomPoint();
			}
		}
	}
	else
	{
		// Since we are Full or we are already eating
		// We should stop moving.
		if(this.IsMoving())
		    this.StopMoving();
	}
};













