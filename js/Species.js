var Species = Class.extend({

	init: function(){
		this.MatureRadius = 48/2;
		this.MaximumEnergyPerUnitRadius = 100*10;
		this.IsCarnivore = false;
		this.IsPlant = false;
		this.MaximumSpeed = 4;
		this.Skin = null;
		this.InvisibleOdds = 5;
		this.EyesightRadius = 5;
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
