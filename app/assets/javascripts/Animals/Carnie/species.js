// 1. Set the species attributes
var species = new Species();
species.Name = "Carnie";
species.IsCarnivore = true;

// Determine how your animal looks like
species.Skin = AnimalSkin.scorpion; // options: ant, beetle, inchworm, scorpion or spider

// How big can your creature grow? 
// The bigger the more powerful it is, but the slower it is to reproduce.
species.MatureSize = 30;

// Sum should equal to 100.
species.PercentOfMaximumEnergyPerUnitRadius = 70;
species.PercentOfMaximumEatingSpeedPerUnitOfRadius = 0;
species.PercentOfMaximumAttackDamagePerUnitRadius = 0;
species.PercentOfMaximumDefendDamagePerUnitRadius = 0;
species.PercentOfMaximumEyeSightRadius = 30;
species.PercentOfMaximumSpeed = 0;
species.PercentOfMaximumInvisibleOdds = 0;

// 2. Write the behaviour
var me = new AnimalMind(species);
