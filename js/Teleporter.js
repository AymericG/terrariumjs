var Teleporter = Class.extend({
	init: function(world, rectangle, vector)
	{
		this.World = world;
		this.Rectangle = rectangle;
        this.Vector = vector;
        this.TeleportWait = 0;
        this.Speed = 2;
	},
	AddTeleportTick: function(){
		this.TeleportWait++;
		if (this.TeleportWait > EngineSettings.TeleportWait)
			this.TeleportWait = EngineSettings.TeleportWait;
	},
	ResetTeleportWait: function(){
		this.TeleportWait = 0;
	},
    ///  Determines if the given organism state is within teleport zone.
    Contains: function(state)
    {
    	if (this.TeleportWait < EngineSettings.TeleportWait)
    		return false;

        var difference = this.Rectangle.Location.X - (state.Position.X - state.Radius);
        if (difference < 0)
        {
            // Negative means rectangle boundary < state boundary
            if (-difference > this.Rectangle.Width + 1)
            {
                // X isn't overlapping or adjacent
                return false;
            }
        }
        else
        {
            // state boundary <=  rectangle boundary
            if (difference > (state.Radius*2) + 1)
            {
                // X isn't overlapping or adjacent
                return false;
            }
        }

        difference = this.Rectangle.Location.Y - (state.Position.Y - state.Radius);
        if (difference < 0)
        {
            // Negative means rectangle boundary < state boundary
            if (-difference > this.Rectangle.Height + 1)
            {
                // Y isn't overlapping or adjacent
                return false;
            }
        }
        else
        {
            // state boundary <=  rectangle boundary
            if (difference > (state.Radius*2) + 1)
            {
                // Y isn't overlapping or adjacent
                return false;
            }
        }
        return true;
    },
    Move: function(){
		if (this.Vector == null || this.Rectangle.Contains(this.Vector.Destination))
        {
            // find a new place to move to
            var destination = new Point(MathUtils.RandomBetween(0, this.World.WorldWidth), MathUtils.RandomBetween(0, this.World.WorldHeight));
            this.Vector = new MovementVector(destination, this.Speed);
        }
        else
        {
            var currentRectangle = this.Rectangle;
            var vector = currentRectangle.Location.Substract(this.Vector.Destination);
            if (vector.Magnitude() <= this.Vector.Speed)
                this.Vector = null; // We've arrived
            else
            {
                var unitVector = vector.GetUnitVector();
                var speedVector = unitVector.Scale(this.Vector.Speed);
                currentRectangle.Location = currentRectangle.Location.Add(speedVector);
            }
        }

    },

    TeleportIfInside: function(organism)
    {
		if (this.Contains(organism.State))
	    {
	    	this.ResetTeleportWait();
	    	var interGalacticMessage = JSON.stringify({ url: organism.MindUrl, code: organism.MindCode });
	    	$(window).peertrigger("teleport", interGalacticMessage);
	    	organism.Trigger("Disappear", organism);
	    }

    }
});