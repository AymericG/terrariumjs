var PlantState = OrganismState.extend({
	init:function(speciesData){
		this._super(speciesData);
        this.Height = this.Radius*this.HeightToRadiusRatio;
        this.FoodChunks = this.CurrentMaxFoodChunks();
	},
    Serializable: function(withSeenOrganisms){
        var stateObject = this._super(withSeenOrganisms);
        stateObject.Height = this.Height;
        stateObject.FoodChunks = this.FoodChunks;
        return stateObject;
    },
    HeightToRadiusRatio: 1,

	CurrentMaxFoodChunks: function(){
    	return this.Radius * EngineSettings.PlantFoodChunksPerUnitOfRadius;
    },
    IncreaseRadiusTo: function(newRadius){
        var newHeight = newRadius * this.HeightToRadiusRatio;
        var additionalRadius = newRadius - this.Radius;
        this._super(newRadius);
        this.Height = newHeight;
        var foodChunks = additionalRadius * EngineSettings.PlantFoodChunksPerUnitOfRadius;
        this.Log("Gaining " + foodChunks + " food chunks");
        this.FoodChunks += foodChunks;
    },

    Grow: function(){
		this.IncreaseRadiusTo(this.Radius + 1);
		this.BurnEnergy(EngineSettings.PlantRequiredEnergyPerUnitOfRadiusGrowth);
		this.ResetGrowthWait();
	},

    Heal: function(){
		var maxHealingChunks = EngineSettings.PlantMaxHealingPerTickPerRadius * this.Radius;

        var usableEnergy = this.StoredEnergy() - this.UpperBoundaryForEnergyState(EnergyState.Deterioration);
        if (usableEnergy <= 0) 
        	return;

        var availableHealingChunks = usableEnergy / EngineSettings.PlantRequiredEnergyPerUnitOfHealing;
        if (availableHealingChunks < maxHealingChunks)
            maxHealingChunks = availableHealingChunks;

        var foodChunkDelta = 0;
        if (this.CurrentMaxFoodChunks() - this.FoodChunks < maxHealingChunks)
        {
            foodChunkDelta = this.CurrentMaxFoodChunks() - this.FoodChunks;
            this.FoodChunks = this.CurrentMaxFoodChunks();
        }
        else
        {
            foodChunkDelta = maxHealingChunks;
            this.FoodChunks += foodChunkDelta;
        }
        if (foodChunkDelta != 0)
            this.Log("Gaining " + foodChunkDelta + " food chunks");

        this.BurnEnergy(foodChunkDelta * EngineSettings.PlantRequiredEnergyPerUnitOfHealing);
	},
    ///  This is incomplete, this should be a characteristic that enables
    ///  creatures to determine how much light they need to obtain maximum
    ///  energy per tick.  This can be used to create trees that require
    ///  lots of light or moss that requires very little.
    OptimalLightPercentage: 100,

    /// The amount of energy a plant gets decreases linearly as you get away from the optimal
    /// <param name="availableLightPercentage">The amount of light available to give to this plant.</param>
    GiveEnergy: function(availableLightPercentage)
    {
        var percentageFromOptimal = availableLightPercentage - this.OptimalLightPercentage;
        if (percentageFromOptimal < 0)
            percentageFromOptimal = -percentageFromOptimal;

        var energyGained = Math.round((1 - percentageFromOptimal/100)*EngineSettings.MaxEnergyFromLightPerTick);

        this.StoredEnergy(this.StoredEnergy() + energyGained);
    }

});

