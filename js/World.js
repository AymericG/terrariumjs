var World = Class.extend({
	init: function(width, height)
	{
		this.WorldWidth = width;
		this.WorldHeight = height;
		this.Organisms = {};
		this.OrganismCount = 0;
		this.OrganismIndex = 0;
		
		this.GridHeight = this.WorldHeight >> EngineSettings.GridHeightPowerOfTwo;
		this.GridWidth = this.WorldWidth >> EngineSettings.GridWidthPowerOfTwo;

		this._cellOrganisms = this.Matrix(this.GridWidth, this.GridHeight);

        // This member is here just so we don't create the visibility matrix for every call
        // to FindOrganismsInView.
        this._invisible = this.Matrix((EngineSettings.MaximumEyesightRadius + EngineSettings.BaseEyesightRadius + EngineSettings.MaxGridRadius)*2 + 1, (EngineSettings.MaximumEyesightRadius + EngineSettings.BaseEyesightRadius + EngineSettings.MaxGridRadius)*2 + 1);
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
	FillCells: function(state, clear)
    {
    	var cellX = state.GridX();
        var cellY = state.GridY();
        var cellRadius = state.CellRadius();
        for (var x = cellX - cellRadius; x <= cellX + cellRadius; x++)
            for (var y = cellY - cellRadius; y <= cellY + cellRadius; y++)
            {
                if (clear)
                {
					if (typeof(this._cellOrganisms[x]) == "undefined")
            			console.log("undefined:" + x);

                    // Make sure we are only clearing ourselves, the value may be null because clearindex
                    // may have been called
                    if (this._cellOrganisms[x][y] != null && this._cellOrganisms[x][y].Id != state.Id)
                    	throw new ApplicationException("Cell contains an unexpected organism: " + this._cellOrganisms[x][y].Id + " instead of " + state.Id);
                    this._cellOrganisms[x][y] = null;
                }
                else
                {
					if (typeof(this._cellOrganisms[x]) == "undefined")
            			console.log("undefined:" + x);

                    // Make sure there was no one else here
                    if (this._cellOrganisms[x][y] != null)
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
        	console.log("Retrying to find an empty spot.");
            newLocation = new Point(MathUtils.RandomBetween(cellRadius, this.GridWidth - 1 - cellRadius),
                                    MathUtils.RandomBetween(cellRadius, this.GridHeight - 1 - cellRadius));
            retry--;
        }
        if (retry == 0)
        	return null; // If we couldn't find a spot delete the organism
        
        return new Point(newLocation.X << EngineSettings.GridWidthPowerOfTwo, newLocation.Y << EngineSettings.GridHeightPowerOfTwo);
    },
	AddOrganism: function(workerUrl, mindCode){

		var self = this;

		if (this.OrganismCount >= EngineSettings.MaxOrganismCount)
		{
			console.log("Maximum number of organisms per terrarium reached.");
			return;
		}
		var organismId = this.OrganismIndex;

		var organism = new Organism(organismId, workerUrl, mindCode, self);	

		organism.Subscribe(Signals.Ready, function(){

			// Add to world
			var availableSpot = self.FindEmptySpot(this.State.CellRadius()); 
			if (availableSpot == null)
			{
				console.log("Could not find any empty space.");
				return null;
			}

			self.OrganismCount++;
			self.OrganismIndex++;
			organism.State.Position = availableSpot;
			var state = organism.State;
			self.FillCells(state, false);
			self.Organisms[organismId] = organism;
		});

		organism.Send({ signal: Signals.Born, World: self.Raw(), Code: mindCode });

		organism.Subscribe("Reproduce", function(){
			AddOrganism(organism.MindUrl, organism.MindCode);
		});

		organism.Subscribe("Disappear", function(){
			var state = self.Organisms[this.Id].State; 
			self.FillCells(state, true);
			delete self.Organisms[this.Id];
			self.OrganismCount--;
		});

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
	}
});
