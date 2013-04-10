// 1. Set the species attributes
var species = new Species();
species.Name = "Herbie";

// Determine how your animal looks like
species.Skin = AnimalSkin.inchworm; // options: ant, beetle, inchworm, scorpion or spider

// How big can your creature grow? 
// The bigger the more powerful it is, but the slower it is to reproduce.
species.MatureSize = 26; // between 24 and 48

// Sum should equal to 100.
species.PercentOfMaximumEnergyPerUnitRadius = 0;
species.PercentOfMaximumEatingSpeedPerUnitOfRadius = 0;
species.PercentOfMaximumAttackDamagePerUnitRadius = 0;
species.PercentOfMaximumDefendDamagePerUnitRadius = 0;
species.PercentOfMaximumEyeSightRadius = 50;
species.PercentOfMaximumSpeed = 0;
species.PercentOfMaximumInvisibleOdds = 50;

// For more information about what functions you can use
// Check out the SDK files: https://github.com/AymericG/terrariumjs/tree/master/app/assets/javascripts/SDK
var me = new AnimalMind(species);
