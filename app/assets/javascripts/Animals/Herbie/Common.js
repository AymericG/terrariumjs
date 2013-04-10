// Looks for target plants, and starts moving towards the first one it finds
me.ScanForTargetPlant = function() 
{
	if (this.State.SeenOrganisms.length == 0)
		this.WriteTrace("I can't see anyone, am I blind?");	
	else
		this.WriteTrace("I can see " + this.State.SeenOrganisms.length + " organism(s)");	


	var minDistance = 9999;
	var closestPlant = null;

	for (var i = 0; i < this.State.SeenOrganisms.length; i++)
	{
		var target = this.State.SeenOrganisms[i];
		if (target.IsPlant()){
			var distanceToPlant = this.State.Position.DistanceWith(target.Position);
			if (distanceToPlant < minDistance)
			{
				minDistance = distanceToPlant;
				closestPlant = target;
			}
		}
	}

	if (closestPlant != null)
	{
		this.TargetPlant = closestPlant;
		this.BeginMoving(new MovementVector(this.TargetPlant.Position, 2));
		return true;
	}

    // Tell the caller we couldn't find a target
    return false;
};

me.MoveToRandomPoint = function(){
	// Pick random point on the map.
	var y = MathUtils.RandomBetween(0, this.World.WorldHeight);
	var x = MathUtils.RandomBetween(0, this.World.WorldWidth);
	this.WriteTrace("Moving to random point...");	
	this.BeginMoving(new MovementVector(new Point(x, y), 2));
};

me.TargetPlant = null;

