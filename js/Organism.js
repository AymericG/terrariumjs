var Organism = ClassWithEvents.extend({

	init: function(id, mindUrl, mindCode, world){

		this._super();
		this.Id = id;
		this.InProgressActions = new PendingActions();
		this.Nerve = new BodyNerve(this, mindUrl);
		this.MindUrl = mindUrl;
		this.MindCode = mindCode;
		this.Direction = Direction.Left;
		this.World = world;
	},
	InitializeState: function(speciesData)
	{
		var species = new Species();
		species.Refresh(speciesData);

		if (speciesData.IsPlant)
			this.State = new PlantState(species);
		else
			this.State = new AnimalState(species);
		this.State.Id = this.Id;
	},
	DisplayAction: function(){
		if (!this.State.IsAlive())
			return DisplayAction.Die;

		if (this.IsEating())
			return DisplayAction.Eat;

		if (this.IsMoving())
			return DisplayAction.Move;

		if (this.IsIncubating())
			return DisplayAction.Reproduce;
		return DisplayAction.Nothing;   
	},
	IsIncubating: function(){
		return this.InProgressActions.ReproduceAction != null;
	},
	IsMoving: function(){
		return this.InProgressActions.MoveToAction != null;
	},
	IsEating: function(){
		return this.InProgressActions.EatAction != null;
	},
	Move: function(){

		if (!this.State.IsAlive() || !this.IsMoving())
			return;

		try
		{
			var p1 = this.State.Position;
			var p2 = this.CurrentMoveToAction().MoveTo.Destination;
			var wentThroughLoopOnce = false;
			var maxValidDestination = p1;
		    var x0 = p1.X;
		    var y0 = p1.Y;
		    var x1 = p2.X;
		    var y1 = p2.Y;
		    var dy = y1 - y0;
		    var dx = x1 - x0;
		    var stepx = 0;
		    var stepy = 0;
		    var timeslice = 0;

		    if (dy < 0)
		    {
		        dy = -dy;
		        stepy = -1;
		    }
		    else
		        stepy = 1;

		    if (dx < 0)
		    {
		        dx = -dx;
		        stepx = -1;
		    }
		    else
		        stepx = 1;

		    dy <<= 1;
		    dx <<= 1;
		    //if (!organism.State.IsPlant())
		    //	console.log("START");
		    // start the first segment at the initial point at time 0
		    var gridX = x0 >> EngineSettings.GridWidthPowerOfTwo;
		    var gridY = y0 >> EngineSettings.GridWidthPowerOfTwo;
		    //var segment = new MovementSegment(null, organism, new Point(x0, y0), 0, gridX, gridY);
		    //segment.EndingPoint = new Point(p1.X, p1.Y);
		    //this.AddSegment(segment);
		    if (p1 == p2)
		        return;

		    if (dx > dy)
		    {
		        // Determine how many points we'll plot and estimate time by that
		        if ((x1 - x0) != 0)
		            timeslice = Math.round(this.TimeWindow/((x1 - x0)*stepx));

		        var fraction = dy - (dx >> 1); // same as 2*dy - dx
		        while (x0 != x1)
		        {
		            if (fraction >= 0)
		            {
		                y0 += stepy;
		                fraction -= dx; // same as fraction -= 2*dx
		            }
		            x0 += stepx;
		            fraction += dy; // same as fraction -= 2*dy

		            // See if we've crossed into a new grid square
		            previousGridX = gridX;
		            previousGridY = gridY;

		            gridX = x0 >> EngineSettings.GridWidthPowerOfTwo;
		            gridY = y0 >> EngineSettings.GridHeightPowerOfTwo;
		            //console.log("X: " + gridX + " Y:" + gridY);
		            //segment.ExitTime += timeslice;
		            if (gridX != previousGridX || gridY != previousGridY)
		            {
		            	wentThroughLoopOnce = true;
		            	// Move
		            	if (this.World.WouldOnlyOverlapSelf(this.Id, gridX, gridY, this.State.CellRadius()))
		            	{
		            		// Valid destination.
		            		maxValidDestination = new Point(x0, y0);
		            	}
		            	else
		            	{
		            		this.DoMove(maxValidDestination);
		            		return;
		            	}

		                // End the segment since we've entered a new grid square
		                //var lastSegment = segment;
		                //segment = new MovementSegment(lastSegment, organism, new Point(x0, y0), lastSegment.ExitTime, gridX, gridY);
		                //segment.ExitTime = lastSegment.ExitTime;
		                //lastSegment.Next = segment;
		                //this.AddSegment(segment);
		            }

		            //var newEndingPoint = new Point(x0, y0);
		            //segment.EndingPoint = newEndingPoint;
		        }
		    }
		    else
		    {
		        if ((y1 - y0) != 0)
		            timeslice = Math.round(this.TimeWindow / ((y1 - y0)*stepy));

		        var fraction = dx - (dy >> 1);
		        while (y0 != y1)
		        {
		            if (fraction >= 0)
		            {
		                x0 += stepx;
		                fraction -= dy;
		            }
		            y0 += stepy;
		            fraction += dx;

		            previousGridX = gridX;
		            previousGridY = gridY;

		            // See if we've crossed into a new grid square
		            gridX = x0 >> EngineSettings.GridWidthPowerOfTwo;
		            gridY = y0 >> EngineSettings.GridHeightPowerOfTwo;
		            //console.log("X: " + gridX + " Y:" + gridY);

		            //segment.ExitTime += timeslice;
		            if (gridX != previousGridX || gridY != previousGridY)
		            {
		            	wentThroughLoopOnce = true;
		            	// Move
		            	if (this.World.WouldOnlyOverlapSelf(this.Id, gridX, gridY, this.State.CellRadius()))
		            	{
		            		// Valid destination.
		            		maxValidDestination = new Point(x0, y0);
		            	}
		            	else
		            	{
		            		this.DoMove(maxValidDestination);
							return;
		            	}
		            }

		      //      var newEndingPoint = new Point(x0, y0);
		        //    segment.EndingPoint = newEndingPoint;
		        }
		    }
		    this.DoMove(wentThroughLoopOnce ? maxValidDestination : p2);
		    // The last segment doesn't exit the grid, so its exit time is zero
		    //segment.ExitTime = 0;
		}
		catch (e)
		{
			console.log("ERROR: Move");
		}
	},
	DoMove: function(destination)
	{
		if (destination == null)
		{
			this.InProgressActions.MoveToAction = null;
			this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.Blocked });
			return;
		}
		//if (destination.EqualsTo(this.State.Position))
		//	return;
		
		this.World.FillCells(this.State, true);
		// We reached the end.
		var vector = this.State.Position.Substract(destination);
		var fullVector = this.State.Position.Substract(this.CurrentMoveToAction().MoveTo.Destination);
		if (fullVector.Magnitude() <= this.CurrentMoveToAction().MoveTo.Speed || (vector.X == 0 && vector.Y == 0))
        {
			this.InProgressActions.MoveToAction = null;
			this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached });
			return;
		}

		var moveVector = destination.Substract(this.State.Position);
		
		var unitVector = vector.GetUnitVector();
		if (unitVector.EqualsTo(vector))
		{
			// Rounding issue. Just go there.
			this.State.Position = destination;
		
		}
		else
		{
			var speedVector = unitVector.Scale(this.CurrentMoveToAction().MoveTo.Speed);
			this.Direction = this.DirectionFromVector(vector);
			var destinationWithSpeed = this.State.Position.Add(speedVector); 
			var destinationReached = destinationWithSpeed.EqualsTo(destination);
		    /*
		    console.log("v:" + vector.ToString());
		    console.log("u:" + unitVector.ToString());
		    console.log("d:" + destinationWithSpeed.ToString());
		    console.log("d2:" + destination.ToString());*/
		    this.State.Position = destinationWithSpeed;
			this.State.BurnEnergy(this.State.EnergyRequiredToMove(moveVector.Magnitude(), this.CurrentMoveToAction().MoveTo.Speed));
		}
		this.World.FillCells(this.State, false);

		if (!this.State.IsAlive())
			return;

		if (this.CurrentMoveToAction().MoveTo.Destination.EqualsTo(this.State.Position))
	    {
	       // Destination reached
			this.InProgressActions.MoveToAction = null;
	        this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached });
	    }
	    else if (destinationReached)
	    {
	        // If where they landed wasn't where they wanted to go, then they got blocked.  Stop movement and notify them
			this.InProgressActions.MoveToAction = null;
	        this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.Blocked });

	    }
	},
	DirectionFromVector: function(vector)
	{

		var direction = vector.ToAngleInDegrees();
		if (direction >= 68 && direction < 113)
			return Direction.Down;
		if (direction >= 113 && direction < 158)
			return Direction.DownLeft;
		if (direction >= 158 && direction < 203)
			return Direction.Left;
		if (direction >= 203 && direction < 248)
			return Direction.UpLeft;
		if (direction >= 248 && direction < 293)
			return Direction.Up;
		if (direction >= 293 && direction < 338)
			return Direction.UpRight;
		if (direction >= 338 && direction < 23)
			return Direction.Right;
		return Direction.DownRight;
	},
	Incubate: function(){
		if (!this.State.IsAlive() || this.InProgressActions.ReproduceAction == null || !this.State.ReadyToReproduce()) 
			return;
		
		if (this.State.IncubationTicks == EngineSettings.TicksToIncubate)
		{
	    	// raise event incubate for game to create copy.
	    	this.Trigger("Reproduce", this);
	    	
	    	this.Send({ signal: Signals.ReproduceCompleted });
			this.State.ResetReproductionWait();
	    	this.InProgressActions.ReproduceAction = null;
		}
		else 
		{
			if (this.State.EnergyState() >= EnergyState.Normal)
			{
				// Only incubate if the organism isn't hungry	    	
				this.State.BurnEnergy(this.State.Radius * EngineSettings.AnimalIncubationEnergyPerUnitOfRadius);
			    this.State.AddIncubationTick();
			}
		}
	},

	Age: function(){

		if (this.State.IsAlive())
		{
			this.State.AddTickToAge();

            if (!this.State.IsPlant())
            {
				if (this.State.IsAlive())
	                this.State.BurnEnergy(this.State.Radius * EngineSettings.BaseAnimalEnergyPerUnitOfRadius);
            } 
			else
            {
				if (this.State.IsAlive())
                    this.State.BurnEnergy(this.State.Radius * EngineSettings.BasePlantEnergyPerUnitOfRadius);

                // When plants die they disappear
                if (this.State.EnergyState() == EnergyState.Dead)
                {
                	console.log("Disappear. By lack of energy");
            		this.Trigger("Disappear", this);
            	}
            }
        }
        else
        {
            if (!this.State.IsPlant())
            {
                this.State.AddRotTick();
                if (this.State.RotTicks > EngineSettings.TimeToRot)
                {
                	console.log("Disappear. End of rot");
            		this.Trigger("Disappear", this);
            	}
            }
        }

	},

	Grow: function(){
		if (this.State.CanGrow() && this.World.WouldOnlyOverlapSelf(this.Id, this.State.GridX(), this.State.GridY(), this.State.CalculateCellRadius(this.State.Radius + 1)))
	    {
	    	this.World.FillCells(this.State, true);
	    	this.State.Grow();
			this.World.FillCells(this.State, false);
		}
	},

	Send: function(messageObject){
		this.Nerve.Send(messageObject);
	},

	Heal: function(){
		this.State.Heal();

	},
	Scan: function(){
		var foundOrganisms = this.World.FindOrganismsInView(this.State, this.State.Species.EyesightRadius);

		var seen = [];
        
        // Remove any camouflaged animals
        for (var i = 0; i < foundOrganisms.length; i++)
        {
            var state = foundOrganisms[i];

			if (this.Id == state.Id)
				continue;

            // Dead animals aren't hidden
            if (!state.IsAlive())
            {
            	seen.push(state);
            	continue;
            }	
            var invisible = Math.random() * 100;
            if (invisible > state.Species.InvisibleOdds)
            {
            	seen.push(state);
                continue;
            }
        }

        // Put seen into State so that it gets serialized.
        this.State.SeenOrganisms = seen; 
        return seen;
	},
	CurrentMoveToAction: function(){
		return this.InProgressActions.MoveToAction;
	},
	Bite: function(){
		if (!this.State.IsAlive() || this.InProgressActions.EatAction == null)
			return;
		var attackerState = this.State;
		var defender = this.World.Organisms[this.InProgressActions.EatAction.TargetOrganismId];
		if (defender == null || typeof(defender) == 'undefined')
		{
			this.InProgressActions.EatAction = null;
			this.Send({ signal: "EatCompleted", BiteSuccessful: false});
			return;
		}
		var defenderState = defender.State;
	        
	    var energyToFill = Math.round((attackerState.Radius * attackerState.Species.MaximumEnergyPerUnitRadius()) - attackerState.StoredEnergy());
	    
	    // Determine how many chunks it would take to fill the animal completely
	    var foodChunkCount = 0;
	    if (defenderState.IsPlant())
	        foodChunkCount = energyToFill / EngineSettings.EnergyPerPlantFoodChunk;
	    else
	        foodChunkCount = energyToFill / EngineSettings.EnergyPerAnimalFoodChunk;
	    foodChunkCount = Math.floor(foodChunkCount);
	    if (foodChunkCount == 0)
	        foodChunkCount = 1;

	    // If this is more than the animal can eat in one bite, limit it to what they can eat
	    if (foodChunkCount > attackerState.Species.EatingSpeedPerUnitRadius() * attackerState.Radius)
	    	foodChunkCount = attackerState.Species.EatingSpeedPerUnitRadius() * attackerState.Radius;
	    console.log("defender: " + defenderState.FoodChunks + " removing " + foodChunkCount);
		
	    if (defenderState.FoodChunks <= foodChunkCount)
	    {
	        foodChunkCount = defenderState.FoodChunks;
	        // remove the defender from the world if we ate them all
			console.log("Disappear. No food chunk left");
			defender.Trigger("Disappear", defender);
			this.InProgressActions.EatAction = null;
	    }
	    else
	    {
	        // Shrink the meat or plant
	        defenderState.FoodChunks = defenderState.FoodChunks - foodChunkCount;
	    }

	    // Determine how much energy we got
	    var newEnergy = 0;
	    if (defenderState.IsPlant())
	        newEnergy = EngineSettings.EnergyPerPlantFoodChunk * foodChunkCount;
	    else
	        newEnergy = EngineSettings.EnergyPerAnimalFoodChunk * foodChunkCount;
	    attackerState.StoredEnergy(attackerState.StoredEnergy() + newEnergy);
	}
});
