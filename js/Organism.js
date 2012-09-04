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
            		this.Trigger("Disappear", this);
            }
        }
        else
        {
            if (!this.State.IsPlant())
            {
                this.State.AddRotTick();
                if (this.State.RotTicks > EngineSettings.TimeToRot)
            		this.Trigger("Disappear", this);
            }
        }

	},

	Grow: function(){
	    this.State.Grow();
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
        return seen;
	},
	CurrentMoveToAction: function(){
		return this.InProgressActions.MoveToAction;
	}
});
