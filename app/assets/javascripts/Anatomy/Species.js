var Species = Class.extend({

	init: function(){
		this.MatureSize = 24;
		this.PercentOfMaximumEnergyPerUnitRadius = 0.2;
		this.PercentOfMaximumEatingSpeedPerUnitOfRadius = 0.2;
		this.PercentOfMaximumAttackDamagePerUnitRadius = 0.2;
		this.PercentOfMaximumDefendDamagePerUnitRadius = 0.1;
		this.PercentOfMaximumEyeSightRadius = 0.1;
		this.PercentOfMaximumSpeed = 0.1;
		this.PercentOfMaximumInvisibleOdds = 0.1;
		this.Name = "No name";
		this.IsCarnivore = false;
		this.IsPlant = false;
		this.Skin = AnimalSkin.ant;
	},
	Validate: function(){
		if ((this.PercentOfMaximumSpeed + 
			this.PercentOfMaximumInvisibleOdds + 
			this.PercentOfMaximumEyeSightRadius + 
			this.PercentOfMaximumEnergyPerUnitRadius + 
			this.PercentOfMaximumDefendDamagePerUnitRadius + 
			this.PercentOfMaximumAttackDamagePerUnitRadius +
			this.PercentOfMaximumEatingSpeedPerUnitOfRadius) != 1){
			throw new InvalidPointsException("The sum of the points should be 1");
		}
	},
	MatureRadius: function(){
		return Math.floor(this.MatureSize / 2);
	},
	InvisibleOdds: function(){
		return Math.round(EngineSettings.InvisibleOddsBase + this.PercentOfMaximumInvisibleOdds * EngineSettings.InvisibleOddsMaximum);
	},
	EyeSightRadius: function(){
		return Math.round(EngineSettings.BaseEyesightRadius + this.PercentOfMaximumEyeSightRadius * EngineSettings.MaximumEyesightRadius);
	},
	MaximumSpeed: function(){
		return Math.round(EngineSettings.SpeedBase + this.PercentOfMaximumSpeed * EngineSettings.SpeedMaximum);
	},
	MaximumDefendDamagePerUnitRadius: function()
	{
		var max = (EngineSettings.BaseDefendedDamagePerUnitOfRadius + this.PercentOfMaximumDefendDamagePerUnitRadius * EngineSettings.MaximumDefendedDamagePerUnitOfRadius) + 0.001;

		if (this.IsCarnivore)
	        return Math.round(max * EngineSettings.CarnivoreAttackDefendMultiplier);
	    else
	        return Math.round(max);
	},
	MaximumAttackDamagePerUnitRadius: function(){
		return Math.round((EngineSettings.BaseInflictedDamagePerUnitOfRadius + this.PercentOfMaximumAttackDamagePerUnitRadius * EngineSettings.MaximumInflictedDamagePerUnitOfRadius) + 0.001);
	},

	EatingSpeedPerUnitRadius: function(){
		return Math.round(EngineSettings.BaseEatingSpeedPerUnitOfRadius + this.PercentOfMaximumEatingSpeedPerUnitOfRadius * EngineSettings.MaximumEatingSpeedPerUnitOfRadius);
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
			return this.MatureRadius() * EngineSettings.PlantLifeSpanPerUnitMaximumRadius;
		if (this.IsCarnivore)
        	return this.MatureRadius() * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius * EngineSettings.CarnivoreLifeSpanMultiplier;
        return this.MatureRadius)_ * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius;

	},
	ReproductionWait: function(){
		if (this.IsPlant)
			return this.MatureRadius() * EngineSettings.PlantReproductionWaitPerUnitRadius;

		return this.MatureRadius() * EngineSettings.AnimalReproductionWaitPerUnitRadius;
	},
	GrowthWait: function(){
		return Math.round((this.LifeSpan() / 2) / (this.MatureRadius() - this.InitialRadius()));
	},
	InitialRadius: function(){
		return Math.round(EngineSettings.MinMatureSize / 2) - 1;
	}

});
