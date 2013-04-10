// Function used to move towards our prey or meal
me.MoveToTarget = function() 
{
    // Make sure we aren't moving towards a null target
    if (this.TargetAnimal == null) 
        return;

    // Follow our target as quickly as we can
    this.WriteTrace("Moving at maximum speed: " + this.State.Species.MaximumSpeed());
    this.BeginMoving(new MovementVector(this.TargetAnimal.Position, this.State.Species.MaximumSpeed()));
};

me.FindNewTarget = function() 
{
    var minDistance = 9999;
    var closestTarget = null;

	for (var i = 0; i < this.State.SeenOrganisms.length; i++)
	{
		var target = this.State.SeenOrganisms[i];
		if (!target.IsPlant() && !(this.IsMySpecies(target) && target.IsAlive()))
        {
            var distance = this.State.Position.DistanceWith(target.Position);
            if (distance < minDistance)
            {
                minDistance = distance;
                closestTarget = target;
            }
        }
	}
    this.TargetAnimal = closestTarget;
};

me.TargetAnimal = null;
