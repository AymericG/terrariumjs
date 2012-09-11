var Species = Class.extend({

	init: function(){
		this.MatureSize = 24;
		this.PercentOfMaximumEnergyPerUnitRadius = 20;
		this.PercentOfMaximumEatingSpeedPerUnitOfRadius = 20;
		this.PercentOfMaximumAttackDamagePerUnitRadius = 20;
		this.PercentOfMaximumDefendDamagePerUnitRadius = 10;
		this.PercentOfMaximumEyeSightRadius = 10;
		this.PercentOfMaximumSpeed = 10;
		this.PercentOfMaximumInvisibleOdds = 10;
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
			this.PercentOfMaximumEatingSpeedPerUnitOfRadius) != 100){
			throw new InvalidPointsException("The sum of the points should be 100");
		}
	},
	MatureRadius: function(){
		return Math.floor(this.MatureSize / 2);
	},
	InvisibleOdds: function(){
		return Math.round(EngineSettings.InvisibleOddsBase + this.PercentOfMaximumInvisibleOdds/100 * EngineSettings.InvisibleOddsMaximum);
	},
	EyeSightRadius: function(){
		return Math.round(EngineSettings.BaseEyesightRadius + this.PercentOfMaximumEyeSightRadius/100 * EngineSettings.MaximumEyesightRadius);
	},
	MaximumSpeed: function(){
		return Math.round(EngineSettings.SpeedBase + this.PercentOfMaximumSpeed/100 * EngineSettings.SpeedMaximum);
	},
	MaximumDefendDamagePerUnitRadius: function()
	{
		var max = (EngineSettings.BaseDefendedDamagePerUnitOfRadius + this.PercentOfMaximumDefendDamagePerUnitRadius/100 * EngineSettings.MaximumDefendedDamagePerUnitOfRadius) + 0.001;

		if (this.IsCarnivore)
	        return Math.round(max * EngineSettings.CarnivoreAttackDefendMultiplier);
	    else
	        return Math.round(max);
	},
	MaximumAttackDamagePerUnitRadius: function(){
		return Math.round((EngineSettings.BaseInflictedDamagePerUnitOfRadius + this.PercentOfMaximumAttackDamagePerUnitRadius/100 * EngineSettings.MaximumInflictedDamagePerUnitOfRadius) + 0.001);
	},

	EatingSpeedPerUnitRadius: function(){
		return Math.round(EngineSettings.BaseEatingSpeedPerUnitOfRadius + this.PercentOfMaximumEatingSpeedPerUnitOfRadius/100 * EngineSettings.MaximumEatingSpeedPerUnitOfRadius);
	},
	MaximumEnergyPerUnitRadius: function(){
		return Math.floor(EngineSettings.MaxEnergyBasePerUnitRadius + this.PercentOfMaximumEnergyPerUnitRadius/100 * EngineSettings.MaxEnergyMaximumPerUnitRadius);
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
        return this.MatureRadius() * EngineSettings.AnimalLifeSpanPerUnitMaximumRadius;

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
