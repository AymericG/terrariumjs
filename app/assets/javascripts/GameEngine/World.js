var World = ClassWithEvents.extend({
	init: function(width, height)
	{
        this._super();
		this.WorldWidth = width;
		this.WorldHeight = height;
		this.Organisms = {};
		this.OrganismCount = 0;
		this.OrganismIndex = 1;
		
		this.GridHeight = this.WorldHeight >> EngineSettings.GridHeightPowerOfTwo;
		this.GridWidth = this.WorldWidth >> EngineSettings.GridWidthPowerOfTwo;

		this._cellOrganisms = this.Matrix(this.GridWidth, this.GridHeight);
        this.Teleporter = new Teleporter(this, new Rectangle(225, 225, 48, 48), null);
            
        // This member is here just so we don't create the visibility matrix for every call
        // to FindOrganismsInView.
        this._invisible = this.Matrix((EngineSettings.MaximumEyesightRadius + EngineSettings.BaseEyesightRadius + EngineSettings.MaxGridRadius)*2 + 1, (EngineSettings.MaximumEyesightRadius + EngineSettings.BaseEyesightRadius + EngineSettings.MaxGridRadius)*2 + 1);
        var self = this;

        $(window).peerbind("teleport", {
            peer:  function(e) { 
                var interGalacticMessage = JSON.parse(e.peerData);
                self.AddOrganism(interGalacticMessage.url, interGalacticMessage.code, interGalacticMessage.generation);
            },
            local: function(e) { 
                // Nothing.
            }
        });

	},
	Matrix: function(width, height){
		var matrix = new Array(width);
		for (var i = 0; i < width; i++)
		    matrix[i] = new Array(height);
		return matrix;		
	},
	Raw: function(){
		return {
			WorldWidth: this.WorldWidth,
			WorldHeight: this.WorldHeight
		};
	},
    GetAvailableLight: function(plant)
    {
        var maxX = plant.GridX() + plant.CellRadius() + 25;
        if (maxX > this.GridWidth - 1)
            maxX = this.GridWidth - 1;
        var overlappingPlantsEast = this.FindOrganismsInCells(plant.GridX() + plant.CellRadius(),
                                                         maxX, plant.GridY() - plant.CellRadius(),
                                                         plant.GridY() + plant.CellRadius());

        var minX = plant.GridX() - plant.CellRadius() - 25;
        if (minX < 0)
            minX = 0;
        var overlappingPlantsWest = this.FindOrganismsInCells(minX, plant.GridX() - plant.CellRadius(),
                                                         plant.GridY() - plant.CellRadius(),
                                                         plant.GridY() + plant.CellRadius());

        var maxAngleEast = 0;
        for (var i = 0; i < overlappingPlantsEast.length; i++)
        {
            var targetPlant = overlappingPlantsEast[i];
            if (!targetPlant.IsPlant()) 
                continue;
            var currentAngle = Math.atan2(targetPlant.Height, targetPlant.Position.X - plant.Position.X);
            if (currentAngle > maxAngleEast)
                maxAngleEast = currentAngle;
        }

        var maxAngleWest = 0;
        for (var i = 0; i < overlappingPlantsWest.length; i++)
        {
            var targetPlant = overlappingPlantsWest[i];
            if (!targetPlant.IsPlant()) 
                continue;
            var currentAngle = Math.atan2(targetPlant.Height, plant.Position.X - targetPlant.Position.X);
            if (currentAngle > maxAngleWest)
                maxAngleWest = currentAngle;
        }

        return Math.round(((Math.PI - maxAngleEast + maxAngleWest)/Math.PI)*100);
    },
	FillCells: function(state, clear)
    {
        var cellX = state.GridX();
        var cellY = state.GridY();
        var cellRadius = state.CellRadius();
        for (var x = cellX - cellRadius; x < cellX + cellRadius; x++)
            for (var y = cellY - cellRadius; y < cellY + cellRadius; y++)
            {
                if (clear)
                {
                    // Make sure we are only clearing ourselves, the value may be null because clearindex
                    // may have been called
                    if (this._cellOrganisms[x][y] != null && this._cellOrganisms[x][y].Id != state.Id)
                    	console.log("Cell contains an unexpected organism: " + this._cellOrganisms[x][y].Id + " instead of " + state.Id);
                    this._cellOrganisms[x][y] = null;
                }
                else
                {
                    // Make sure there was no one else here
                    if (this._cellOrganisms[x][y] != null && this._cellOrganisms[x][y].Id != state.Id)
                    	console.log("(" + x + ", " + y + ") there is someone there: " + this._cellOrganisms[x][y].Id);
                    this._cellOrganisms[x][y] = state;
                }
            }
    },
    FindOrganismsInCells: function(minGridX, maxGridX, minGridY, maxGridY)
    {  
        var lastFound = null;

        // Since organisms are represented at multiple places in the grid, make
        // sure we only get one instance
        var foundHash = {};
        var foundOrganisms = [];
        
        for (var x = minGridX; x <= maxGridX; x++)
        {
            for (var y = minGridY; y <= maxGridY; y++)
            {
            	if (typeof(this._cellOrganisms[x]) == "undefined")
            		console.log("undefined:" + x);
                var current = this._cellOrganisms[x][y];
                if (current == null) 
                	continue;

                // If it's the same as the last one, skip the hashable lookup
                // since it's expensive and we'll often find the same organism over and over
                // in a row
                if (lastFound != null && lastFound == current) 
                	continue;

                if (foundHash[current.Id] == null)
                {
                    foundHash[current.Id] = current;
                    foundOrganisms.push(current);
                }

                lastFound = current;
            }
        }

        return foundOrganisms;
    },
    FindEmptySpot: function(cellRadius)
    {
        var	newLocation = new Point(MathUtils.RandomBetween(cellRadius, this.GridWidth - 1 - cellRadius),
                                    MathUtils.RandomBetween(cellRadius, this.GridHeight - 1 - cellRadius));
        var retry = 20;
        while (retry > 0 && this.FindOrganismsInCells(newLocation.X - cellRadius, newLocation.X + cellRadius, newLocation.Y - cellRadius, newLocation.Y + cellRadius).length != 0)
        {
            newLocation = new Point(MathUtils.RandomBetween(cellRadius, this.GridWidth - 1 - cellRadius),
                                    MathUtils.RandomBetween(cellRadius, this.GridHeight - 1 - cellRadius));
            retry--;
        }
        if (retry == 0)
        	return null; // If we couldn't find a spot delete the organism
        
        return new Point(newLocation.X << EngineSettings.GridWidthPowerOfTwo, newLocation.Y << EngineSettings.GridHeightPowerOfTwo);
    },
	AddOrganism: function(workerUrl, mindCode, generation, dna){
        if (!generation)
            generation = 0;

		var self = this;

		if (this.OrganismCount >= EngineSettings.MaxOrganismCount)
		{
			console.log("Maximum number of organisms per terrarium reached.");
			return;
		}
		var organismId = this.OrganismIndex;

		var organism = new Organism(organismId, workerUrl, mindCode, self);	

		organism.Subscribe(Signals.Born, function(){
            if (typeof(self.Organisms[this.Id]) != 'undefined')
            {
                // this fixes a weird bug that makes us receive several times the Born event for a specific individual.
                // TODO: fix the issue rather than use this hack.
                return;
            }
			// Add to world
			var availableSpot = self.FindEmptySpot(this.State.CellRadius()); 
			if (availableSpot == null)
			{
				console.log("Could not find any empty space.");
				return;
			}

			self.OrganismCount++;
			self.OrganismIndex++;
			organism.State.Position = availableSpot;
            organism.State.Generation = generation + 1;
            
            this.Subscribe("Reproduce", function(){ 
                var childOrganism = self.AddOrganism(this.MindUrl, this.MindCode, organism.State.Generation, organism.InProgressActions.ReproduceAction.Dna);
            });
            this.Subscribe("Disappear", function(){
                var state = self.Organisms[this.Id].State; 
                self.FillCells(state, true);
                delete self.Organisms[this.Id];
                self.OrganismCount--;
            });

            var state = this.State;
            self.FillCells(state, false);
            self.Organisms[organismId] = this;
            self.Trigger("OrganismAdded", this);
		});

		organism.Send({ signal: Signals.Init, World: self.Raw(), Dna: dna });
		return organism;
	},
	FindOrganismsInView: function(state, radius){
		var foundOrganisms = [];
        var foundHash = {};
        var originX = state.GridX();
        var originY = state.GridY();
        var middleX = -originX + state.CellRadius() + radius;
        var middleY = -originY + state.CellRadius() + radius;
        var xIncrement = 0;
        var yIncrement = 0;

        // The first ring is all visible
        var currentRadius = state.CellRadius() + 1;
        var currentX = originX - currentRadius;
        var currentY = originY - currentRadius;

        for (var side = 0; side < 4; side++)
        {
            switch (side)
            {
                case 0:
                    xIncrement = 1;
                    yIncrement = 0;
                    break;
                case 1:
                    xIncrement = 0;
                    yIncrement = 1;
                    break;
                case 2:
                    xIncrement = -1;
                    yIncrement = 0;
                    break;
                case 3:
                    xIncrement = 0;
                    yIncrement = -1;
                    break;
            }

            for (var count = 0; count < currentRadius << 1; count++)
            {
                if (currentX >= 0 && currentY >= 0 && currentX < this.GridWidth && currentY < this.GridHeight)
                {
                    var currentOrganism = this._cellOrganisms[currentX][currentY];
                    if (currentOrganism != null)
                    {
                        if (foundHash[currentOrganism.Id] == null)
                        {
                            foundHash[currentOrganism.Id] = currentOrganism;
                            foundOrganisms.push(currentOrganism);
                        }
                    }

                    this._invisible[currentX + middleX][currentY + middleY] = 0;
                }

                currentX += xIncrement;
                currentY += yIncrement;
            }
        }

        for (currentRadius = state.CellRadius() + 2; currentRadius <= state.CellRadius() + radius; currentRadius++)
        {
            // Look at each point on a square of radius currentRadius
            // Look at the two points that are between this point and the origin
            // if they are invisible, this point is invisible

            // p1 is in the diagonal direction from [x,y] to [originX,originY] and
            // p2 is in the horizontal/vertical direction from [x,y] to [originX, originY].
            // p2 collapses to point_1 if j = 0 or i = 0
            currentX = originX - currentRadius;
            currentY = originY - currentRadius;
            for (var side = 0; side < 4; side++)
            {
                switch (side)
                {
                    case 0:
                        xIncrement = 1;
                        yIncrement = 0;
                        break;
                    case 1:
                        xIncrement = 0;
                        yIncrement = 1;
                        break;
                    case 2:
                        xIncrement = -1;
                        yIncrement = 0;
                        break;
                    case 3:
                        xIncrement = 0;
                        yIncrement = -1;
                        break;
                }

                for (var count = 0; count < currentRadius << 1; count++)
                {
                    if (currentX >= 0 && currentY >= 0 && currentX < this.GridWidth && currentY < this.GridHeight)
                    {
                        var i = currentX - originX;
                        var j = currentY - originY;

                        // These actually calculate -1 * sign not just the sign function
                        var signI;
                        if (i < 0)
                        {
                            signI = 1;
                        }
                        else if (i > 0)
                        {
                            signI = -1;
                        }
                        else
                        {
                            signI = 0;
                        }

                        var signJ;
                        if (j < 0)
                        {
                            signJ = 1;
                        }
                        else if (j > 0)
                        {
                            signJ = -1;
                        }
                        else
                        {
                            signJ = 0;
                        }

                        var absI;
                        if (i < 0)
                        {
                            absI = -i;
                        }
                        else
                        {
                            absI = i;
                        }

                        var absJ;
                        if (j < 0)
                        {
                            absJ = -j;
                        }
                        else
                        {
                            absJ = j;
                        }

                        // Check first point which is the diagonal direction from [x,y] to [originX,originY]
                        var p1X;
                        var p1Y;
                        if (absJ > absI)
                        {
                            // We are in the  90 < theta < 45 degrees region of every quadrant
                            p1X = currentX;
                            p1Y = signJ + currentY;
                        }
                        else
                        {
                            p1X = signI + currentX;
                            p1Y = signJ + currentY;
                        }

                        // Check second point
                        // if Abs(j) == Abs(i) then we are on a diagonal, so secondpoint is the same as first point
                        var p2X;
                        var p2Y;
                        if (absJ != absI)
                        {
                            p2X = signI + currentX;
                            p2Y = signJ + currentY;
                        }
                        else
                        {
                            p2X = p1X;
                            p2Y = p1Y;
                        }

                        // if p1 or p2 was invisible or they were something that blocks visibility
                        if (this._invisible[p1X + middleX][p1Y + middleY] == 1 ||
                            this._invisible[p2X + middleX][p2Y + middleY] == 1)
                        {
                            this._invisible[currentX + middleX][currentY + middleY] = 1;
                        }
                        else
                        {
                            var currentOrganism = this._cellOrganisms[currentX][currentY];
                            if (currentOrganism != null)
                            {
                                // if there is an organism here, mark this spot as invisible
                                // (even though it really isn't)
                                // so the outer cells will be invisible too
                                this._invisible[currentX + middleX][currentY + middleY] = 1;

                                if (foundHash[currentOrganism.Id] == null)
                                {
                                    foundHash[currentOrganism.Id] = currentOrganism;
                                    foundOrganisms.push(currentOrganism);
                                }
                            }
                            else
                            {
                                this._invisible[currentX + middleX][currentY + middleY] = 0;
                            }
                        }
                    }

                    currentX += xIncrement;
                    currentY += yIncrement;
                }
            }
        }

        return foundOrganisms;
	},
    WouldOnlyOverlapSelf: function(organismId, gridX, gridY, cellRadius)
    {
        var minGridX = gridX - cellRadius;
        var maxGridX = gridX + cellRadius;
        var minGridY = gridY - cellRadius;
        var maxGridY = gridY + cellRadius;

        // If it would be out of bounds, return false.
        if (minGridX < 0 || maxGridX > this.GridWidth - 1 ||
            minGridY < 0 || maxGridY > this.GridHeight - 1)
            return false;

        for (var x = minGridX; x <= maxGridX; x++)
        {
            for (var y = minGridY; y <= maxGridY; y++)
            {
                if (this._cellOrganisms[x][y] == null) 
                    continue;
                if (this._cellOrganisms[x][y].Id != organismId)
                    return false;
            }
        }

        return true;
    }
});
