var MovementSegment = Class.extend({
	init: function(previous, organism, startingPoint, entryTime, gridX, gridY)
	{
		this.Organism = organism;
		this.StartingPoint = startingPoint;
		this.EntryTime = entryTime;
		this.GridX = gridX;
		this.GridY = gridY;
		this.Previous = previous;
		this.Next = null;
		this.CellsLeftToResolve = 0;
		this.EndingPoint = null;
		this.ExitTime = 0;
		this.BlockedBy = null;

	},
	SetCellsLeftToResolve: function(value)
	{
		if (value == 0)
        {
            // We're now resolved.  If we're not clipped, we're active
            if (!this.IsClipped())
            {
                this.Active = true;
                if (this.Previous != null)
                {
                    // If previous isn't active, we shouldn't have gotten this far
                    this.Previous.Active = false;
                }
            }
        }
        else if (value < 0)
            value = 0;
        this.CellsLeftToResolve = value;
	},
	IsClipped: function()
	{
		// Segments are guaranteed to be able to stay in the cell they started in
		// so if EntryTime == 0 it can't be clipped
		// When a single segment is clipped, all subsequent segments get clipped too
		// so we only need to check one back to see if it is clipped
		return this.EntryTime != 0 && this.Previous.Next == null;
	},
	// True if this segment represents a stationary creature
    IsStationarySegment: function()
	{
		return ((this.StartingPoint == null && this.EndingPoint == null) || this.StartingPoint.EqualsTo(this.EndingPoint)) && this.EntryTime == 0 && this.ExitTime == 0;
	},
	IsResolved: function(){
		return this.CellsLeftToResolve == 0;
	},
	IsStartingSegment: function()
    {
        return this.EntryTime == 0;
    },
    ClipSegment: function(blocker)
    {
        var segment = this;
        segment.Previous.BlockedBy = blocker;

        while (segment != null)
        {
            // the starting segment should never get clipped, therefore there should always be
            // a previous segment
            segment.Previous.Next = null;

            // Once one cell clips it, it doesn't matter what the other cells get, they are clipped as well
            segment.SetCellsLeftToResolve(0);

            // Clip all subsequent segments
            segment = segment.Next;
        }
    }
});