var Species = Class.extend({

	init: function(){
		this.MatureRadius = 12;
		this.PercentOfMaximumEnergyPerUnitRadius = 0.2;
		this.PercentOfMaximumEatingSpeedPerUnitOfRadius = 0.2;

		this.IsCarnivore = false;
		this.IsPlant = false;
		this.MaximumSpeed = 4;
		this.Skin = null;
		this.InvisibleOdds = 5;
		this.EyesightRadius = 5;

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

		if (this.IsCarnivore)
        	return this.MatureRadius * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius * EngineSettings.CarnivoreLifeSpanMultiplier;
        return this.MatureRadius * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius;

	},
	ReproductionWait: function(){
		return this.MatureRadius * EngineSettings.AnimalReproductionWaitPerUnitRadius;
	},
	GrowthWait: function(){
		return (this.LifeSpan() / 2) / (this.MatureRadius - this.InitialRadius());
	},
	InitialRadius: function(){
		return Math.round(EngineSettings.MinMatureSize / 2) - 1;
	}

});
