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
    /*MaxEnergy: function(){
        return this.CurrentMaxFoodChunks();
    },
    StoredEnergy: function(){
        return this.FoodChunks;
    },
*/
    IncreaseRadiusTo: function(newRadius){
        var newHeight = newRadius * this.HeightToRadiusRatio;
        var additionalRadius = newRadius - this.Radius;
        this._super(newRadius);
        this.Height = newHeight;
        this.FoodChunks += additionalRadius * EngineSettings.PlantFoodChunksPerUnitOfRadius;
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
        this.BurnEnergy(foodChunkDelta * EngineSettings.PlantRequiredEnergyPerUnitOfHealing);
	}    
});

