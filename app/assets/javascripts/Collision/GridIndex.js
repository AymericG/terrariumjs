var GridIndex = Class.extend({
	init: function(world){
		this.StartSegments = Array();
		this.World = world;
		this._gridSquares = {};
		this._sortedList = Array();
	},
	TimeWindow: 10000,
	// Take an OrganismState and a path to move it on (from Point1 to Point2) and break up this
	// path into MovementSegments when it moves between cells.  Each MovementSegment represents the part of the path
	// that is within a single cell.
	//
	// Even though we are only drawing a single line and rasterizing it along one path through the grid, 
	// we can assume that the center of every cell that this organism occupies follows exactly the same path
	// and has segments that break down at exactly the same timeframes.  Thus we call the AddSegment() routine
	// for each MovementSegment.  AddSegment() wraps this MovementSegment with a wrapper (SegmentWrapper) and adds 
	// this wrapper to every cell that the creature occupies so that all the cells that are occupied at any given
	// are properly noted.
	// 
	// AddPath() records the time that the path entered and left each cell in the path.
	// Each cell of the grid is 2^GridWidthPowerOfTwo x 2^GridHeightPowerOfTwo pixels in size  
	// Each is a power of two so we can shift instead of dividing
	// The first square of the grid starts at 0, 0 and goes to 2^GridWidthPowerOfTwo - 1, 2^GridHeightPowerOfTwo - 1
	// Use Bresenham's algorithm to do the rasterization and figure out when the path enters or leaves grid squares.
	AddPath: function (organism, p1, p2)
	{
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
	    var segment = new MovementSegment(null, organism, new Point(x0, y0), 0, gridX, gridY);
	    segment.EndingPoint = new Point(p1.X, p1.Y);
	    this.AddSegment(segment);
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
	            gridX = x0 >> EngineSettings.GridWidthPowerOfTwo;
	            gridY = y0 >> EngineSettings.GridHeightPowerOfTwo;
	            //console.log("X: " + gridX + " Y:" + gridY);
	            segment.ExitTime += timeslice;
	            if (gridX != segment.GridX || gridY != segment.GridY)
	            {
	                // End the segment since we've entered a new grid square
	                var lastSegment = segment;
	                segment = new MovementSegment(lastSegment, organism, new Point(x0, y0), lastSegment.ExitTime, gridX, gridY);
	                segment.ExitTime = lastSegment.ExitTime;
	                lastSegment.Next = segment;
	                this.AddSegment(segment);
	            }

	            var newEndingPoint = new Point(x0, y0);
	            segment.EndingPoint = newEndingPoint;
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

	            // See if we've crossed into a new grid square
	            gridX = x0 >> EngineSettings.GridWidthPowerOfTwo;
	            gridY = y0 >> EngineSettings.GridHeightPowerOfTwo;
	            //console.log("X: " + gridX + " Y:" + gridY);

	            segment.ExitTime += timeslice;
	            if (gridX != segment.GridX || gridY != segment.GridY)
	            {
	                // End the segment since we've entered a new grid square
	                var lastSegment = segment;
	                segment = new MovementSegment(lastSegment, organism, new Point(x0, y0), lastSegment.ExitTime, gridX, gridY);
	                segment.ExitTime = lastSegment.ExitTime;
	                lastSegment.Next = segment;
	                this.AddSegment(segment);
	            }

	            var newEndingPoint = new Point(x0, y0);
	            segment.EndingPoint = newEndingPoint;
	        }
	    }
	    // The last segment doesn't exit the grid, so its exit time is zero
	    segment.ExitTime = 0;
	    //if (!organism.State.IsPlant())
	    //	console.log("END");
	},
	// Adds a MovementSegment to all the proper cells in the grid to account for the creature's size by wrapping it 
	// with a SegmentWrapper and adding the wrapper to the proper cells. When we calculate a creature's movement we have
	// to mark all the cells in a square around the center that their size covers as occupied.  This function reserves
	// all the cells that a given segment would cover for a creature.
	AddSegment: function(segment)
	{
        // Figure out how many cells on either side of the center we need to reserve
        var cellRadius = segment.Organism.State.CellRadius();

        if (segment.Previous == null)
        {
            // Beginning of a segment
            // We should have never started in a position where the radius of the organism 
            // went outside the bounds of the universe
            this.StartSegments.push(segment);
        }
        else
        {
            // If this segment pushes the organisms radius outside the bounds of the universe, clip it now
            // and don't bother evaluating it later
            if (segment.GridX < 0 || segment.GridY < 0 ||
                segment.GridX - cellRadius < 0 ||
                segment.GridY - cellRadius < 0 ||
                segment.GridX + cellRadius > this.World.GridWidth - 1 ||
                segment.GridY + cellRadius > this.World.GridHeight - 1)
            {
            	segment.Previous.Next = null;
                return;
            }
        }

        // Do the top and bottom rows
        var list = null;
        var wrapper = null;
        for (var x = segment.GridX - cellRadius; x <= segment.GridX + cellRadius; x++)
        {
            // *** Top row of square ***
            // Make a unique hash for every square in the grid
            var hash = (x << 16) | (segment.GridY - cellRadius);

            // retrieve the set of SegmentWrappers that are already in the cell of the grid
            list = this._gridSquares[hash];
            if (list == null || typeof(list) == 'undefined')
            {
                // None exist yet, create an ArrayList to hold them
                list = [];
                this._gridSquares[hash] = list;
            }

            // Create a wrapper for this segment, give it a backpointer to the arraylist that contains
            // all the segments in this cell
            wrapper = new SegmentWrapper(segment, list);

            // Add the SegmentWrapper itself to the list of segments in this cell
            list.push(wrapper);

            // Now add the SegmentWrapper to our master sorted list of all SegmentWrappers anywhere
            this._sortedList.push(wrapper);

            // CellsLeftToResolve is there to recognize the fact that an animal overlaps many squares.
            // Until you know that it can occupy all of the squares it moves into, it can't move into
            // any of them.  This property keeps track of whether we have resolved them all or not.
            // Here, we are adding one to it for every cell we occupy with this segment.
            segment.SetCellsLeftToResolve(segment.CellsLeftToResolve + 1);

            // *** Bottom row of square ***
            hash = (x << 16) | (segment.GridY + cellRadius);
            list = this._gridSquares[hash];
            if (list == null || typeof(list) == 'undefined')
            {
                list = [];
                this._gridSquares[hash] = list;
            }

            wrapper = new SegmentWrapper(segment, list);
            list.push(wrapper);
            this._sortedList.push(wrapper);
            segment.SetCellsLeftToResolve(segment.CellsLeftToResolve + 1);
        }

        // Do left and right columns
        for (var y = segment.GridY - cellRadius + 1; y <= segment.GridY + cellRadius - 1; y++)
        {
            // Make a unique hash for every square in the grid
            var hash = ((segment.GridX - cellRadius) << 16) | y;
            list = this._gridSquares[hash];
            if (list == null || typeof(list) == 'undefined')
            {
                list = [];
                this._gridSquares[hash] = list;
            }
            wrapper = new SegmentWrapper(segment, list);
            list.push(wrapper);
            this._sortedList.push(wrapper);
            segment.SetCellsLeftToResolve(segment.CellsLeftToResolve + 1);

            hash = ((segment.GridX + cellRadius) << 16) | y;
            list = this._gridSquares[hash];
            if (list == null || typeof(list) == 'undefined')
            {
                list = [];
                this._gridSquares[hash] = list;
            }
            // Make sure two organisms didn't start in the same place
            wrapper = new SegmentWrapper(segment, list);
            list.push(wrapper);
            this._sortedList.push(wrapper);
            segment.SetCellsLeftToResolve(segment.CellsLeftToResolve + 1);
        }

	},
	// Terrarium needs to use a movement algorithm that moves a large number of elements down independent paths and has them
	// stop if they bump into each other during this movement (we make this problem more tractable by dividing the screen up
	// into cells so there aren't as many positions to calculate).  This is further complicated by the fact that creatures occupy
	// more than one cell in the game grid, and that, if they get blocked in movement, we need to know what they bumped into so 
	// we can notify the creature.
	// 
	// The basic approach Terrarium takes to moving is this: Imagine if you walked a loop that touched each creature
	// in turn and moved them just a little bit at a time (called a "MovementSegment").  You stop moving a creature when it 
	// can't occupy the entire set of cells it requires to move to the next MovementSegment in it's path or when it is simply
	// done moving. 
	//
	// Since a creature's size is bigger than one cell, it actually occupies multiple cells in the game space. To move it,
	// we need to ensure that it can occupy all of the cells in it's new location.  Thus, a key idea in the algorithm is that each
	// "MovementSegment" of its journey is pointed to by the set of cells it occupies at that point in time (SegmentWrappers do the 
	// pointing) and that the MovementSegment gets "resolved" when we know if the set of SegmentWrappers that point to it can move
	// where they need to move to represent the entire space the creature needs.  "Resolved" means we are guaranteed it either:
	// - successfully passes through the cells without stopping OR 
	// - will stop in the cells OR 
	// - got clipped and won't occupy these cells
	// Until we resolve a MovementSegment, we can't resolve its previous MovementSegment in the path (except the starting MovementSegment
	// which is always guaranteed to validly occupy a cell since it started there) because its state in one set of cells depends on 
	// what it does next.  For example, if it can't occupy all of the cells in the next MovementSegment, it must stop in
	// previous set of cells.
	//
	// Here's the algorithm:
	// 1. Break up the path a creature wants to follow on a given turn into a number of "MovementSegments" by laying the path out
	//      on the grid we use in the game and chopping it up whenever the path enters or leaves a cell.  Mark the time it entered
	//      and leaves the cell (this is done by the AddPath() function).
	// 2. Put pointers to this single MovementSegment in every cell that the creature occupies at that point in time.  These pointers
	//      are called "SegmentWrappers" (this is done by the AddSegment() function).
	// 3. Sort all SegmentWrappers by EntryTime (the time they entered a cell), and then by State.ID for those where the EntryTime 
	//      is the same.  This guarantees that we walk through all SegmentWrappers that should be moved together right after each
	//      other so we can resolve whether the move can occur.  We need to incrementally move all creatures at once because we want
	//      them to bump into each other if they cross paths at the right time instead of jumping over each other.
	// 4. Walk through each SegmentWrapper in sorted order and try to "resolve" them:
	//      If the SegmentWrapper is blocked from being in its cell by an active segment that is already in that cell it is "clipped".
	//          Clip all subsequent segments and leave the previous segment as active.
	//      If a segment is not clipped, reduce CellsLeftToResolve by one since this SegmentWrapper can validly occupy this cell.
	//          once CellsLeftToResolve hits zero, this means that the state of all SegmentWrappers that use this segment have
	//          been resolved and the segment will get marked as "active" meaning that we know all of the cells the organism wants to 
	//          occupy can be used at this point in time.  We also unset the active bit on the previous segment in the chain.
	ResolvePaths: function()
	{
		// Sort every Segment wrapper in the entire grid
		this._sortedList.sort(function(x, y) { 
		
            var segmentX = x.Segment;
            var segmentY = y.Segment;
            var difference = segmentX.EntryTime - segmentY.EntryTime;

            if (difference == 0)
            {
                // If they have the same EntryTime, we need to then sort by ID
                // We only care that we get a consistent sorting, not that they are actually
                // alphabetical, so we use the hashcode
                return segmentX.Organism.Id - segmentY.Organism.Id;
            }
            return difference;
		});

        // Walk through them all in sorted order.  Since the sort is time based, this ensures that 
        // organisms that try to occupy the same square at the same time will bump into each other
        for (var i = 0; i < this._sortedList.length; i++)
        {
        	var wrapper = this._sortedList[i];
            // Grab the actual segment we are dealing with
            var segment = wrapper.Segment;

            // Pull out the list of other segments that also occupy this cell
            var list = wrapper.ParentList;

            if (segment.IsResolved())
            {
                // if we've hit a segment that is resolved even though there were more cells to check 
                // it must mean that it is either the first segment (which always gets the cell it starts in) 
                // or it got clipped already.

                // This segment's situation has already been resolved
                continue;
            }
            if (segment.IsStartingSegment())
            {
                // Starting segments always get the cell they started in, don't clip
                segment.SetCellsLeftToResolve(0);
            }
            else if (list.length == 1)
            {
                // if it's the only segment in a cell, it gets it, don't clip
                segment.SetCellsLeftToResolve(segment.CellsLeftToResolve - 1);
                continue;
            }
            else
            {
            //	console.log("Has conflicting segments in " + segment.GridX + " " + segment.GridY);
                // This segment is in a cell that has other overlapping segments -- see if there is a conflict
                for (var i = 0; i < list.length; i++)
                {
                	var testWrapper = list[i];
                    var testSegment = testWrapper.Segment;

                    // An object can never block itself
                    if (testSegment.Organism.Id == segment.Organism.Id)
                        continue;
					
					console.log("Has conflicting segments in " + segment.GridX + " " + segment.GridY);
                
				    if (!testSegment.Active)
                     continue;

                    // There is an active segment in this cell, therefore, segment is Blocked
                    segment.ClipSegment(testSegment.Organism);
                    break;
                }

                segment.SetCellsLeftToResolve(segment.CellsLeftToResolve - 1);
            }
        }

	}
	
});