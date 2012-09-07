var AnimalState = OrganismState.extend({
	init: function(speciesData){
		this._super(speciesData);
		this.Damage = 0;
		this.RotTicks = 0;
	},
	Serializable: function(withSeenOrganisms){
		var stateObject = this._super(withSeenOrganisms);
		stateObject.Damage = this.Damage;
		stateObject.RotTicks = this.RotTicks;
		return stateObject;
	},

	AddRotTick: function()
	{
    	this.RotTicks++;
    },
    IncreaseRadiusTo: function(newRadius)
    {
        var additionalRadius = newRadius - this.Radius;
        this._super(newRadius);
        this.FoodChunks += additionalRadius * EngineSettings.FoodChunksPerUnitOfRadius;
    },

	EnergyRequiredToMove: function(distance, speed){
		return distance * this.Radius * speed * EngineSettings.RequiredEnergyPerUnitOfRadiusSpeedDistance;
	},
    Grow: function(){
        this.IncreaseRadiusTo(this.Radius + 1);
		this.BurnEnergy(EngineSettings.AnimalRequiredEnergyPerUnitOfRadiusGrowth);
        this.ResetGrowthWait();
    },
    Heal: function(){
		var maxHealing = EngineSettings.AnimalMaxHealingPerTickPerRadius * this.Radius;
		var usableEnergy = this.StoredEnergy() - this.UpperBoundaryForEnergyState(EnergyState.Hungry);
	    if (usableEnergy > 0)
	    {
	        var availableHealing = usableEnergy / EngineSettings.AnimalRequiredEnergyPerUnitOfHealing;
	        if (availableHealing < maxHealing)
	            maxHealing = availableHealing;

	        var damageDelta = 0;
	        if (this.Damage - maxHealing < 0)
	        {
	            damageDelta = this.Damage;
	            this.Damage = 0;
	        }
	        else
	        {
	            damageDelta = maxHealing;
	            this.Damage = this.Damage - maxHealing;
	        }
	        this.BurnEnergy(damageDelta * EngineSettings.AnimalRequiredEnergyPerUnitOfHealing);
	    }
	}

});