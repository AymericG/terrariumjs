// Sample Carnivore
// Strategy: This animal stands still until it sees something tasty and then
// bites it.  If any dead animals are within range it eats them.
me.OnIdle = function() {

	if (this.TargetAnimal != null) 
    {
        // See if our target animal still exists (it may have died)
        // LookFor returns null if it isn't found
        this.TargetAnimal = this.LookFor(this.TargetAnimal.Id);
    }

	// Our Creature will reproduce as often as possible so
	// every turn it checks CanReproduce to know when it
	// is capable.  If so we call BeginReproduction with
	// a null Dna parameter to being reproduction.
	if (this.CanReproduce())
		this.BeginReproduction(null);

	// If we are already doing something, then we don't
	// need to do something else.  Lets leave the
	// function.
	if (this.IsAttacking() || this.IsMoving() || this.IsEating()) 
	    return;

	// Try to find a new target if we need one.
	if (this.TargetAnimal == null) 
	    this.FindNewTarget();

    // If we have a target animal then lets check him out
    if(this.TargetAnimal != null) 
    {
        // If the target is alive, then we need to kill it
        // else we can immediately eat it.
        if (this.TargetAnimal.IsAlive()) 
        {
            // If we are within attacking range, then
            // lets eat the creature.  Else we'll
            // try to move into range
            if (this.WithinAttackingRange(this.TargetAnimal)) 
                this.BeginAttacking(this.TargetAnimal);
            else 
                this.MoveToTarget();
        }
        else 
        {
            // If the creature is dead then we can try to eat it.
            // If we are within eating range then we'll try to
            // eat the creature, else we'll move towards it.
            if (this.WithinEatingRange(this.TargetAnimal)) 
            {
                if (this.CanEat()) 
                    this.BeginEating(this.TargetAnimal);
            } 
            else 
            {
                this.MoveToTarget();
            }
        }
    } 
    else 
    {
        // If we stop moving we conserve energy.  Sometimes
        // this works better than running around.
        this.StopMoving();
    }
};

