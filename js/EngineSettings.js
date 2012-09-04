var EngineSettings = {
    ///   Represents the largest possible value that can be placed
    ///   into the MatureSize attribute.  No creature may grow to
    ///   be larger than this constant.
	MaxMatureSize: 48,
	MaxOrganismCount: 10,
	RequiredEnergyPerUnitOfRadiusSpeedDistance: 0.005,
	TickInterval: 50,
	TicksToIncubate: 10,
	AnimalReproductionWaitPerUnitRadius: 8,
	PlantReproductionWaitPerUnitRadius: 25,
	AnimalIncubationEnergyMultiplier: 1.5,
	FoodChunksPerUnitOfRadius: 25,
	EnergyPerAnimalFoodChunk: 1,
    ///   Represents the base distance a creature can see if they place
    ///   0 points into the EyesightPointsAttribute.
    ///   This distance is in Terrarium Cells, so you have to multiply
    ///   by 8 to get the actual distance in Terrarium Units (pixels).
	BaseEyesightRadius: 5,

    ///   Represents the maximum distance a creature can see if they place
    ///   MaxAvailableCharacteristicPoints into the EyesightPointsAttribute.
    ///   This distance is in Terrarium Cells, so you have to multiply
    ///   by 8 to get the actual distance in Terrarium Units (pixels).
	MaximumEyesightRadius: 10,

    ///   The amount of food chunks a plant amounts to. Larger plants will
    ///   have a larger amount of food chunks available to herbivores than
    ///   smaller plants.
	PlantFoodChunksPerUnitOfRadius: 50,

	///   The amount of energy required to heal a plant by a single
    ///   health unit.
	PlantRequiredEnergyPerUnitOfHealing: 100,

	///   The maximum number of healing points a plant can
	///   heal per tick.  This is multiplied by the Radius of the
	///   plant and so larger plants can heal many more points
	///   than smaller plants.
	PlantMaxHealingPerTickPerRadius: 1,

	///   The amount of energy required to heal a creature by a single
	///   health unit.
	AnimalRequiredEnergyPerUnitOfHealing: 0.1,

    ///   The maximum number of healing points a creature can
    ///   heal per tick.  This is multiplied by the Radius of the
    ///   creature and so larger creatures can heal many more points
    ///   than smaller creatures.
	AnimalMaxHealingPerTickPerRadius: 2,
	BaseAnimalEnergyPerUnitOfRadius: 0.001, // base energy burnt per turn

    ///   The amount of energy burned by a plant each tick just for being
    ///   alive in the game.  This constant is multiplied by the plant's
    ///   radius so smaller plants been less energy per tick than larger
    ///   plants.
	BasePlantEnergyPerUnitOfRadius: 1,

    ///   The amount of time in game ticks that a creature's corpse stays
    ///   in the EcoSystem before it rots away and is removed.  Carnivores
    ///   should make sure to quickly pounce on dead corpses as a food source
    ///   before they rot.
    ///  </para>
    /// </summary>
    TimeToRot: 60,

		///   The amount of time in game ticks that a creature can stay alive.  This
        ///   number is multiplied by the creature's MatureSize so smaller creatures
        ///   will not live as long as larger creatures.
    AnimalLifeSpanPerUnitMaximumRadius: 50,

    ///   This multiplier is used to modify the life span for Carnivores.
    ///   Since Carnivores have double the lifespan of Herbivores they get
    ///   twice as many opportunities for reproduction
    CarnivoreLifeSpanMultiplier: 2,

	///   Represents the smallest possible value that can be placed
    ///   into the MatureSize attribute.  No creature may grow to
    ///   maturity and still be smaller than this constant.
    ///  </para>
    /// </summary>
	MinMatureSize: 25,

	GridHeightPowerOfTwo: 3,
    GridWidthPowerOfTwo: 3
};
EngineSettings.AnimalMatureSizeProvidedEnergyPerUnitRadius = EngineSettings.FoodChunksPerUnitOfRadius * EngineSettings.EnergyPerAnimalFoodChunk;
EngineSettings.AnimalIncubationEnergyPerUnitOfRadius = (EngineSettings.AnimalMatureSizeProvidedEnergyPerUnitRadius / EngineSettings.TicksToIncubate) * EngineSettings.AnimalIncubationEnergyMultiplier;

///   The amount of energy burned by a creature in order to grow a single unit
///   of radius.  For smaller creatures this amount of energy will be quite
///   taxing, but as the creature grows larger the amount of energy taken
///   doesn't affect the creature as much.
EngineSettings.AnimalRequiredEnergyPerUnitOfRadiusGrowth = EngineSettings.MaxEnergyBasePerUnitRadius * (1/5);
    ///   The amount of energy burned by a plant in order to grow a single unit
    ///   of radius.  For smaller plants this amount of energy will be quite
    ///   taxing, but as the plant grows larger the amount of energy taken
    ///   doesn't affect the plant as much.
EngineSettings.PlantRequiredEnergyPerUnitOfRadiusGrowth = EngineSettings.MaxEnergyBasePerUnitRadius * (1/5);

EngineSettings.GridCellHeight = 1 << EngineSettings.GridHeightPowerOfTwo;
EngineSettings.GridCellWidth = 1 << EngineSettings.GridWidthPowerOfTwo;
EngineSettings.MaxGridRadius = (EngineSettings.MaxMatureSize/EngineSettings.GridCellWidth/2) + 1;
