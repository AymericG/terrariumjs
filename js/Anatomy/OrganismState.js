var OrganismState = Class.extend({

	init: function(species){

		this.Species = species;
		this.Radius = this.Species.InitialRadius();
		this.IsImmutable = false;
		this.DeathReason = PopulationChangeReason.NotDead;
		this.TickAge = 0;
		this.IncubationTicks = 0;
		this.ResetReproductionWait();
		this.ResetGrowthWait();
		this.FoodChunks = 0;
		this._storedEnergy = this.MaxEnergy();
		this.SeenOrganisms = [];
	},
	Serializable: function(withSeenOrganisms){
		var state = {};
		state.Id = this.Id;
		state.Radius = this.State;
		state.DeathReason = this.DeathReason;
		state.TickAge = this.TickAge;
		state.IncubationTicks = this.IncubationTicks;
		state.Position = this.Position;
		state.ReproductionWait = this.ReproductionWait;
		state.GrowthWait = this.GrowthWait;
		state.FoodChunks = this.FoodChunks;
		state._storedEnergy = this._storedEnergy;
		state.IsAPlant = this.IsPlant();
		state.Species = this.Species;
		state.SeenOrganisms = [];
		if (withSeenOrganisms)
			for (var i = 0; i < this.SeenOrganisms.length; i++)
				state.SeenOrganisms.push(this.SeenOrganisms[i].Serializable(false));
		return state;
	},
	Refresh: function(data)
	{

		var species = new Species();
		species.Refresh(data.Species);
		this.Species = species;
		delete data.Species;

		for (var property in data)
			this[property] = data[property];
		if (typeof(this.SeenOrganisms) == 'undefined')
			this.SeenOrganisms = [];
		else
		{
			for (var i = 0; i < this.SeenOrganisms.length; i++)
			{
				var seenOrganism = this.SeenOrganisms[i];
					
				var state = null;
				if (seenOrganism.IsAPlant)
					state = new PlantState(species);
				else
					state = new AnimalState(species);
				delete seenOrganism.IsAPlant;
				state.Refresh(seenOrganism);
				this.SeenOrganisms[i] = state;
			}	
		}

	},
	CanGrow: function(){
		return ((this.Radius < this.Species.MatureRadius) && 
			(this.EnergyState() >= EnergyState.Normal) && 
			this.GrowthWait == 0);
	},
	AddIncubationTick: function(){
		this.IncubationTicks++;
	},
	ResetReproductionWait: function(){
		this.ReproductionWait = this.Species.ReproductionWait();
	},
	ResetGrowthWait: function(){
		this.GrowthWait = this.Species.GrowthWait();
	},

	MaxEnergy: function(){
		return this.Species.MaximumEnergyPerUnitRadius() * this.Radius;
	},

	StoredEnergy: function(value){
		if (!value)
			return this._storedEnergy;

		if (this.IsImmutable)
		    throw new GameEngineException("Object is immutable.");

		if (!this.IsAlive())
		    throw new GameEngineException("Dead organisms can't change stored energy.");

		if (value <= 0)
		{
		    this.Kill(PopulationChangeReason.Starved);
		    return;
		}

		value = Math.floor(value);
		if (value > this.Radius * this.Species.MaximumEnergyPerUnitRadius())
		    value = this.Species.MaximumEnergyPerUnitRadius() * this.Radius;

		this._storedEnergy = value;
		return this._storedEnergy;
	},

	EnergyState: function(){
		var energyBuckets = (this.Species.MaximumEnergyPerUnitRadius() * this.Radius) / 5;

		if (this._storedEnergy > energyBuckets * 4)
		    return EnergyState.Full;

		if (this._storedEnergy > energyBuckets * 2)
		    return EnergyState.Normal;

		if (this._storedEnergy > energyBuckets * 1)
		    return EnergyState.Hungry;

		return this._storedEnergy > 0 ? EnergyState.Deterioration : EnergyState.Dead;
	},

	ReadyToReproduce: function(){
		return this.ReproductionWait == 0;
	},

	BurnEnergy: function(energyValue)
    {
		if (this.IsImmutable)
		    throw new GameEngineException("Object is immutable.");

		if (!this.IsAlive())
		    throw new GameEngineException("Dead organisms can't change stored energy.");

		if (this.StoredEnergy() - energyValue <= 0)
		    this.Kill(PopulationChangeReason.Starved);
		else
		{
		    this.StoredEnergy(this.StoredEnergy() - energyValue);
		}
	},

	IsMature: function(){
		return this.Radius == this.Species.MatureRadius;
	},

	PercentEnergy: function(){
		return ((this._storedEnergy / (this.Species.MaximumEnergyPerUnitRadius() * Math.max(1, this.Radius))));
	},

	IsAlive: function(){

		var isAlive = this.StoredEnergy() != 0 &&
			this.DeathReason == PopulationChangeReason.NotDead &&
			this.PercentEnergy() > 0;

		return isAlive;
	},

	AddTickToAge: function()
    {
        if (this.IsImmutable)
            throw new GameEngineException("Object is immutable.");

        if (!this.IsAlive())
            throw new ApplicationException("Dead organisms can't age.");

        this.TickAge++;

        if (this.GrowthWait >= 1)
            this.GrowthWait--;
        else
            this.GrowthWait = 0;

        if (this.ReproductionWait >= 1)
            this.ReproductionWait--;
        else
            this.ReproductionWait = 0;

        if (this.TickAge > this.Species.LifeSpan())
            this.Kill(PopulationChangeReason.OldAge);
    },

    Kill: function (reason)
    {
    	if (this.IsImmutable)
		    throw new GameEngineException("Object is immutable.");

		this._storedEnergy = 0;
		this.DeathReason = reason;
    },

    IsPlant: function(){
    	return this.Species.IsPlant;
    },
    IncreaseRadiusTo: function(newRadius)
    {
    	this.Radius = newRadius;
    },
	UpperBoundaryForEnergyState: function(energyState)
    {
        var energyBuckets = (this.Species.MaximumEnergyPerUnitRadius() * this.Radius) / 5;
        switch (energyState)
        {
            case EnergyState.Dead:
                return 0;
            case EnergyState.Deterioration:
                return energyBuckets*1;
            case EnergyState.Hungry:
                return energyBuckets*2;
            case EnergyState.Normal:
                return energyBuckets*4;
            case EnergyState.Full:
                return this.Species.MaximumEnergyPerUnitRadius() * radius;
            default:
                throw new ApplicationException("Unknown EnergyState.");
        }
    },
    CellRadius: function(){
    	return this.CalculateCellRadius(this.Radius);
    },
    CalculateCellRadius: function(radius){
		if (radius % EngineSettings.GridCellWidth > 0)
		    return (radius >> EngineSettings.GridWidthPowerOfTwo) + 1;
		return radius >> EngineSettings.GridWidthPowerOfTwo;

    },
    GridX: function(){
		return this.Position.X >> EngineSettings.GridWidthPowerOfTwo;
    },
    GridY: function(){
		return this.Position.Y >> EngineSettings.GridWidthPowerOfTwo;
    },
    IsAdjacentOrOverlapping: function(state2)
    {
		return this.IsWithinRect(0, state2);
    },
    IsWithinRect: function(extraRadius, state2)
	{
		if (state2 == null)
			return false;

        var state1Radius = this.CellRadius() + extraRadius;
        var state2Radius = this.CalculateCellRadius(state2.Radius);//TODO: Change back to state2.CellRadius();

        var difference = (this.GridX() - state1Radius) - (state2.GridX() - state2Radius);
        if (difference < 0)
        {
            // Negative means state1 boundary < state2 boundary
            if (-difference > (state1Radius*2) + 1)
            {
                // X isn't overlapping or adjacent
                return false;
            }
        }
        else
        {
            // state2 boundary <=  state1 boundary
            if (difference > (state2Radius*2) + 1)
            {
                // X isn't overlapping or adjacent
                return false;
            }
        }

        difference = (this.GridY() - state1Radius) - (state2.GridY() - state2Radius);
        if (difference < 0)
        {
            // Negative means state1 boundary < state2 boundary
            if (-difference > (state1Radius*2) + 1)
            {
                // Y isn't overlapping or adjacent
                return false;
            }
        }
        else
        {
            // state2 boundary <=  state1 boundary
            if (difference > (state2Radius*2) + 1)
            {
                // Y isn't overlapping or adjacent
                return false;
            }
        }
        return true;
	}
});
