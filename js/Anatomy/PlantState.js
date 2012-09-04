var PlantState = OrganismState.extend({
	init:function(speciesData){
		this._super(speciesData);
        this.Height = this.Radius*this.HeightToRadiusRatio;
        this.FoodChunks = this.CurrentMaxFoodChunks();
	},/*
    ToJavascriptObject: function(){
        var stateObject = this._super();
        stateObject.Height = this.Height;
        stateObject.FoodChunks = this.FoodChunks;
        return stateObject;
    },*/
    HeightToRadiusRatio: 1,

	CurrentMaxFoodChunks: function(){
    	return this.Radius * EngineSettings.PlantFoodChunksPerUnitOfRadius;
    },

    IncreaseRadiusTo: function(newRadius){
        var newHeight = newRadius * this.HeightToRadiusRatio;
        var additionalRadius = newRadius - this.Radius;
        this._super(newRadius);
        this.Height = newHeight;
        this.FoodChunks += additionalRadius * EngineSettings.PlantFoodChunksPerUnitOfRadius;
    },

    Grow: function(){
		//console.log(this.Radius + " " + this.EnergyState() + " " + this.GrowthWait);
            
        if ((this.Radius < this.Species.MatureRadius) && 
			(this.EnergyState() >= EnergyState.Normal) && 
			this.GrowthWait == 0)
		{
            //console.log("Growing to " + this.Radius + 1);
			this.IncreaseRadiusTo(this.Radius + 1);
			this.BurnEnergy(EngineSettings.PlantRequiredEnergyPerUnitOfRadiusGrowth);
			this.ResetGrowthWait();
		}
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
            currentFoodChunks = this.CurrentMaxFoodChunks();
        }
        else
        {
            foodChunkDelta = maxHealingChunks;
            currentFoodChunks += foodChunkDelta;
        }

        this.BurnEnergy(foodChunkDelta * EngineSettings.PlantRequiredEnergyPerUnitOfHealing);
	}    
});

