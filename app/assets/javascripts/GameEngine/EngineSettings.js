var EngineSettings = {
    ///   Represents the largest possible value that can be placed
    ///   into the MatureSize attribute.  No creature may grow to
    ///   be larger than this constant.
	MaxMatureSize: 48,
	MaxOrganismCount: 50,
	RequiredEnergyPerUnitOfRadiusSpeedDistance: 0.005,
	TickInterval: 60,
	TicksToIncubate: 10,
	AnimalReproductionWaitPerUnitRadius: 8,
	PlantReproductionWaitPerUnitRadius: 25,
	AnimalIncubationEnergyMultiplier: 1.5,
	FoodChunksPerUnitOfRadius: 25,
	EnergyPerAnimalFoodChunk: 1,
    TeleportWait: 600,
    ///   Attack and Defense modifier applied to Carnivores.  This
    ///   gives Carnivores an advantage in both attacking and defending
    ///   against Herbivores since they have to attack and expend extra
    ///   energy to obtain food.
    CarnivoreAttackDefendMultiplier: 2,

    ///   Represents the maximum amount of damage that can be absorbed by
    ///   a creature that places MaxAvailableCharacteristicPoints into the
    ///   DefendDamagePointsAttribute.
    ///   The amount of damage absorption taken from this constant is multiplied by the current
    ///   radius of the creature.  This means both MatureSize and the DefendDamagePointsAttribute
    ///   can increase the amount of damage your creature can take.
    MaximumDefendedDamagePerUnitOfRadius: 25,

    ///   Represents the base amount of damage that can be absorbed by
    ///   a creature that places 0 points into the DefendDamagePointsAttribute.
    ///   The amount of damage absorption taken from this constant is multiplied by the current
    ///   radius of the creature.  This means both MatureSize and the DefendDamagePointsAttribute
    ///   can increase the amount of damage your creature can take.
    BaseDefendedDamagePerUnitOfRadius: 50,

    ///   The amount of damage required to before a creature
    ///   is killed.  This is multiplied by the Radius of the
    ///   creature and so larger creatures can take many more
    ///   hits than smaller creatures.
    DamageToKillPerUnitOfRadius: 190,
    ///   Represents the maximum amount of damage that can be dealt by
    ///   a creature that places MaxAvailableCharacteristicPoints into the
    ///   AttackDamagePointsAttribute.
    ///   The amount of damage taken from this constant is multiplied by the current
    ///   radius of the creature.  This means both MatureSize and the AttackDamagePointsAttribute
    ///   can increase the amount of damage your creature can dish out.
    MaximumInflictedDamagePerUnitOfRadius: 25,

    ///   Represents the base amount of damage that can be dealt by
    ///   a creature that places 0 points into the AttackDamagePointsAttribute.
    ///   The amount of damage taken from this constant is multiplied by the current
    ///   radius of the creature.  This means both MatureSize and the AttackDamagePointsAttribute
    ///   can increase the amount of damage your creature can dish out.
    BaseInflictedDamagePerUnitOfRadius: 50,
    ///   The maximum amount of energy a plant can gain per tick from
    ///   the natural light of the EcoSystem.
    MaxEnergyFromLightPerTick: 550,

    ///   The amount of time in game ticks that a plant can stay alive.  This
    ///   number is multiplied by the plant's MatureSize so smaller plants
    ///   will not live as long as larger plants.
    PlantLifeSpanPerUnitMaximumRadius: 150,

    ///   Represents the base food chunks per bite granted to
    ///   a creature that puts 0 points into the EatingSpeedPointsAttribute.
    ///   The number of food chunks taken from this constant is multiplied by the current
    ///   radius of the creature.  This means both MatureSize and the EatingSpeedPointsAttribute
    ///   can increase the number of food chunks taken per bite.
    BaseEatingSpeedPerUnitOfRadius: 1,

    ///   Represents the maximum number of food chunks per bite that can be taken by a
    ///   creature that places MaxAvailableCharacteristicPoints into the EatingSpeedPointsAttribute.
    ///   The number of food chunks taken from this constant is multiplied by the current
    ///   radius of the creature.  This means both MatureSize and the EatingSpeedPointsAttribute
    ///   can increase the number of food chunks taken per bite.
    MaximumEatingSpeedPerUnitOfRadius: 100,

    ///   The amount of energy given to a creature for
    ///   one food chunk from a plant.
    EnergyPerPlantFoodChunk: 1,
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
EngineSettings.MinimumSpeedToMoveAtMinimumEnergy = 5;
EngineSettings.MinimumUnitsToMoveAtMinimumEnergy = 2000;

EngineSettings.EnergyRequiredToMoveMinimumRequirements =
            EngineSettings.MinimumUnitsToMoveAtMinimumEnergy*EngineSettings.MinimumSpeedToMoveAtMinimumEnergy*
            EngineSettings.RequiredEnergyPerUnitOfRadiusSpeedDistance +
            (EngineSettings.MinimumUnitsToMoveAtMinimumEnergy/EngineSettings.MinimumSpeedToMoveAtMinimumEnergy)*
            EngineSettings.BaseAnimalEnergyPerUnitOfRadius;
///   Represents the amount of energy storage per unit radius
///   granted to a creature when 0 points have been placed into
///   the MaximumEnergyPointsAttribute.
///   Even if 0 points are placed into the MaximumEnergyPointsAttribute
///   a creature can still achieve higher energy storage by increasing
///   MatureSize.
EngineSettings.MaxEnergyBasePerUnitRadius = EngineSettings.EnergyRequiredToMoveMinimumRequirements;

///   Represents the highest attainable energy storage
///   per unit radius.  In order to achieve this maximum
///   available energy you must apply MaxAvailableCharacteristicPoints
///   to the MaximumEnergyPointsAttribute.
///   Please note that this value multiplied by your current radius
///   is your actual total energy storage.  This means that putting
///   points into the MaximumEnergyPointsAttribute or increasing the
///   MatureSize of your creature will both increase the total
///   energy storage.
EngineSettings.MaxEnergyMaximumPerUnitRadius = EngineSettings.EnergyRequiredToMoveMinimumRequirements * 20;

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
