var Game = function (canvas, width, height) {
	var self = this;

	this.World = new World(width, height);
	this.Renderer = new Renderer(canvas, width, height, this.World);
	
	this.Started = false;
	

	this.AddOrganism = function(workerUrl, mindCode)
	{
		var organism = self.World.AddOrganism(workerUrl, mindCode);
		if (organism)
		{
			organism.Subscribe(Signals.Ready, function(){
				self.Renderer.AddOrganism(organism);
				if (self.Started)
					organism.Send({ signal: Signals.Tick });
			});

			organism.Subscribe("Disappear", function(){
				self.Renderer.RemoveOrganism(organism);
			});
		}

		return organism;
	};

	this.ForEachOrganism = function(callback)
	{
		for (var organismId in self.World.Organisms) 
			callback(self.World.Organisms[organismId]);
	};
	
	this.AddOrganismFromCode = function(mindCode){
		return AddOrganism("js/OrganismMindCodeLoader.js", mindCode);
	};

	this.Start = function() {
		this.Renderer.Start();
		setInterval(function() { self.Tick(); }, EngineSettings.TickInterval);
		self.Started = true;
	};

	this.MoveAll = function(){
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
		}
	};

	this.Tick = function () {
		this.ForEachOrganism(function(o){ o.Age(); });
		this.ForEachOrganism(function(o){ o.Send({ signal: Signals.Tick }); });
		this.MoveAll();            
		this.ForEachOrganism(function(o){ o.Grow(); });         
		this.ForEachOrganism(function(o){ o.Incubate(); });         
		this.ForEachOrganism(function(o){ o.Heal(); });         
		this.ForEachOrganism(function(o){ o.Scan(); });         
	}
};

