var Game = function (canvas, width, height) {
	var self = this;
	this.Logger = new Logger();
	this.World = new World(width, height, new Teleporter(this, new Rectangle(225, 225, 48, 48), null));
	this.Renderer = new Renderer(canvas, width, height, this.World);
	this.Started = false;

	this.World.Subscribe("OrganismAdded", function(){
		var organism = this;
		if (organism)
		{
			self.Renderer.AddOrganism(organism);
			organism.Subscribe("Disappear", function(){ self.Renderer.RemoveOrganism(organism); });
		}

	});

	this.AddOrganism = function(workerUrl, mindCode)
	{
		var organism = self.World.AddOrganism(workerUrl, mindCode);
		return organism;
	};

	this.ForEachOrganismWithFilter = function(filter, callback)
	{
		for (var organismId in self.World.Organisms) 
		{
			var organism = self.World.Organisms[organismId];
			if (filter(organism))
			{
				try {
					callback(organism);
				}
				catch (e){
					if (e.message)
						organism.Log("EXCEPTION: " + e.message);
					else
						organism.Log("EXCEPTION: " + e);
					organism.State.Kill(PopulationChangeReason.Error);
				}
			}
		}
	},

	this.ForEachLiveOrganism = function(callback)
	{ 
		this.ForEachOrganismWithFilter(function(o) { return o.State.IsAlive(); }, callback);
	};
	this.ForEachLivePlant = function(callback)
	{
		this.ForEachOrganismWithFilter(function(o) { return o.State.IsAlive() && o.State.IsPlant(); }, callback);
	};
	this.ForEachLiveAnimal = function(callback)
	{
		this.ForEachOrganismWithFilter(function(o) { return o.State.IsAlive() && !o.State.IsPlant(); }, callback);
	};
	this.ForEachOrganism = function(callback)
	{
		this.ForEachOrganismWithFilter(function(o) { return true; }, callback);
	};

	this.Start = function() {
		this.Renderer.Start();
		setInterval(function() { self.Tick(); }, EngineSettings.TickInterval);
		self.Started = true;
	};
	this.Tick = function () {
		this.ForEachLiveOrganism(function(o){ o.Send({ signal: Signals.Tick }); });
		this.ForEachOrganism(function(o){ o.Age(); });
		this.ForEachLiveAnimal(function(o){ o.Attack(); });
		this.World.Teleporter.Move();
		this.ForEachLiveAnimal(function(o){ o.Move(); });
		this.ForEachLiveOrganism(function(o){ o.Bite(); });         
		this.ForEachLiveOrganism(function(o){ o.Grow(); });         
		this.ForEachLiveOrganism(function(o){ o.Incubate(); });         
		this.ForEachLiveOrganism(function(o){ o.Heal(); });         
		this.ForEachLivePlant(function(o){ o.GetEnergyFromLight(); });   
		this.World.Teleporter.AddTeleportTick();   
		this.ForEachLiveAnimal(function(o){ o.Teleport(); });   
		this.ForEachLiveOrganism(function(o){ o.Scan(); });  
		this.ForEachLiveOrganism(function(o){ o.Nerve.SendEventQueue(); });  
	}


//	this.MoveAll = function(){
//		this.ForEachAliveOrganism(function(o){ if (!o.State.IsPlant()) o.Move(); });
		/*
		var index = new GridIndex(this.World);
		
		for (var organismId in this.World.Organisms)
		{
		    var organism = this.World.Organisms[organismId];

		    if (organism == null) 
		    	continue;
		    if (!organism.State.IsAlive())
		    	continue;

		    if (organism.State.IsPlant())
		    {
		        // Plants don't move but they need to be added so that the grid is occupied
		        index.AddPath(organism, organism.State.Position, organism.State.Position);
				continue;
			}

	        var animal = organism;

	        if (!animal.IsMoving())
	        {
				// Organism isn't moving but it needs to be added so that the grid is occupied
	            index.AddPath(animal, animal.State.Position, animal.State.Position);
	          	continue;  
	        }
            // Need to move
            var vector = animal.State.Position.Substract(animal.CurrentMoveToAction().MoveTo.Destination);
            var newLocation = null;

            var unitVector = vector.GetUnitVector();
            if (vector.Magnitude() <= animal.CurrentMoveToAction().MoveTo.Speed)
            {
                // We've arrived
                newLocation = animal.CurrentMoveToAction().MoveTo.Destination;
            }
            else
            {
                var speedVector = unitVector.Scale(animal.CurrentMoveToAction().MoveTo.Speed);
                newLocation = animal.State.Position.Add(speedVector);
            }

            index.AddPath(animal, animal.State.Position, newLocation);
	    }

		index.ResolvePaths();

		for (var i = 0; i < index.StartSegments.length; i++)
		{
			var segment = index.StartSegments[i];
		    if (segment.IsStationarySegment())
		    {
		        var stationary = segment.Organism;

		        if (stationary.CurrentMoveToAction() != null)
		        {
		            // This organism wanted to go where it already was, so -- destination reached
		            stationary.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached});
		            stationary.InProgressActions.MoveToAction = null;
		        }

		        continue;
		    }

		    var endSegment = segment;

		    // Find where the organism ended
		    while (endSegment.Next != null)
		    {
		        endSegment = endSegment.Next;
		    }

		    var newOrganism = endSegment.Organism;
		    var moveVector = endSegment.EndingPoint.Substract(endSegment.Organism.State.Position);
		    
		    //
		    this.World.FillCells(newOrganism.State, true);

			newOrganism.Direction = newOrganism.DirectionFromVector(endSegment.Organism.State.Position.Substract(endSegment.EndingPoint));
		    newOrganism.State.Position = endSegment.EndingPoint;

			this.World.FillCells(newOrganism.State, false);
		    
		    newOrganism.State.BurnEnergy(newOrganism.State.EnergyRequiredToMove(moveVector.Magnitude(), newOrganism.CurrentMoveToAction().MoveTo.Speed));

		    // Burning energy may have killed the organism, in which case we can't
		    // send it events because the CurrentMoveToAction is gone
		    if (!newOrganism.State.IsAlive()) 
		    	continue;

		    if (endSegment.ExitTime != 0)
		    {
		        // If where they landed wasn't where they wanted to go, then they got blocked.  Stop movement and notify them
		        newOrganism.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.Blocked });
				newOrganism.InProgressActions.MoveToAction = null;
		    }
		    else if (endSegment.Organism.CurrentMoveToAction().MoveTo.Destination.EqualsTo(newOrganism.State.Position))
		    {
		        // Destination reached
		        newOrganism.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached });
				newOrganism.InProgressActions.MoveToAction = null;
		    }
		}*/
//	};

};

