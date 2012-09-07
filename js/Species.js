var Species = Class.extend({

	init: function(){
		this.MatureRadius = 12;
		this.PercentOfMaximumEnergyPerUnitRadius = 0.2;
		this.PercentOfMaximumEatingSpeedPerUnitOfRadius = 0.2;
		this.PercentOfMaximumAttackDamagePerUnitRadius = 0.2;
		this.Name = "No name";
		this.IsCarnivore = false;
		this.IsPlant = false;
		this.MaximumSpeed = 4;
		this.Skin = null;
		this.InvisibleOdds = 5;
		this.EyesightRadius = 5;

	},
	MaximumAttackDamagePerUnitRadius: function(){
		return Math.round((EngineSettings.BaseInflictedDamagePerUnitOfRadius + this.PercentOfMaximumAttackDamagePerUnitRadius * EngineSettings.MaximumInflictedDamagePerUnitOfRadius) + 0.001);
	},

	EatingSpeedPerUnitRadius: function(){
		return EngineSettings.BaseEatingSpeedPerUnitOfRadius + this.PercentOfMaximumEatingSpeedPerUnitOfRadius * EngineSettings.MaximumEatingSpeedPerUnitOfRadius;
	},
	MaximumEnergyPerUnitRadius: function(){
		return Math.floor(EngineSettings.MaxEnergyBasePerUnitRadius + this.PercentOfMaximumEnergyPerUnitRadius * EngineSettings.MaxEnergyMaximumPerUnitRadius);
	},
	Refresh: function(data)
	{
		for (var property in data)
			this[property] = data[property];
	},
	LifeSpan: function(){

		if (this.IsPlant)
			return this.MatureRadius * EngineSettings.PlantLifeSpanPerUnitMaximumRadius;
		if (this.IsCarnivore)
        	return this.MatureRadius * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius * EngineSettings.CarnivoreLifeSpanMultiplier;
        return this.MatureRadius * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius;

	},
	ReproductionWait: function(){
		if (this.IsPlant)
			return this.MatureRadius * EngineSettings.PlantReproductionWaitPerUnitRadius;

		return this.MatureRadius * EngineSettings.AnimalReproductionWaitPerUnitRadius;
	},
	GrowthWait: function(){
		return Math.round((this.LifeSpan() / 2) / (this.MatureRadius - this.InitialRadius()));
	},
	InitialRadius: function(){
		return Math.round(EngineSettings.MinMatureSize / 2) - 1;
	}

});
