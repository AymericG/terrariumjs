var Signals = {
	MoveCompleted: "MoveCompleted",
	ReproduceCompleted: "ReproduceCompleted",
	AttackCompleted: "AttackCompleted",
	EatCompleted: "EatCompleted",
	Attacked: "Attacked",
	Init: "Init",
	Initialized: "Initialized",
	Born: "Born",

	Tick: "Tick",
	Load: "Load",
	Log: "Log",
	Act: "Act",
	Ready: "Ready",
	Bulk: "Bulk",
};

var ReasonForStop = {
	DestinationReached: "DestinationReached",
	Blocked: "Blocked"
};

var PopulationChangeReason = {
	NotDead: "NotDead",
	Initial: "Initial",
	Born: "Born",
	OldAge: "OldAge",
	TeleportedTo: "TeleportedTo",
	Starved: "Starved",
	Sick: "Sick",
	TeleportedTo: "TeleportedTo",
	Killed: "Killed",
	Error: "Error",
	SecurityViolation: "SecurityViolation",
	Timeout: "Timeout",
	OrganismBlacklisted: "OrganismBlacklisted"
};

var EnergyState = {
	Dead: 0,
	Deterioration: 1,
	Hungry: 2,
	Normal: 3,
	Full: 4
};

var PlantSkin = {
	plant: "plant",
	plantone: "plantone",
	plantthree: "plantthree",
	planttwo: "planttwo"
};

var AnimalSkin = {
	ant: "ant",
	beetle: "beetle",
	inchworm: "inchworm",
	scorpion: "scorpion",
	spider: "spider"
};

var DisplayAction = {

	Attack: "Attack",
	Defend: "Defend",
	Die: "Die",
	Eat: "Eat",
	Move: "Move",
	Nothing: "Nothing"
};

var AnimationIndexes = {
	Attack: 0,
	Defend: 1,
	Die: 2,
	Eat: 3,
	Move: 4,
	Nothing: 4
};

var Direction = {
	Up: "Up",
	UpRight: "UpRight",
	Right: "Right",
	DownRight: "DownRight",
	Down: "Down",
	DownLeft: "DownLeft",
	Left: "Left",
	UpLeft: "UpLeft"
};

var DirectionIndexes = {
	Up: 0,
	UpRight: 1,
	Right: 2,
	DownRight: 3,
	Down: 4,
	DownLeft: 5,
	Left: 6,
	UpLeft: 7
};

///   Provides the various positions that the LeftAntenna and RightAntenna
///   may be in.  Values outside of the allowable range are thrown away
///   and will always default to AntennaPosition.Left.
var AntennaPosition =
{
    ///   The Antenna will be facing Left, this demonstrates a numeric value
    ///   of 0 when using the AntennaValue property of AntennaState.
    Left: 0,
    ///   The Antenna will be facing Right, this demonstrates a numeric value
    ///   of 1 when using the AntennaValue property of AntennaState.
    Right: 1,
    ///   The Antenna will be facing Up, this demonstrates a numeric value
    ///   of 2 when using the AntennaValue property of AntennaState.
    Top: 2,
    ///   The Antenna will be facing Down, this demonstrates a numeric value
    ///   of 3 when using the AntennaValue property of AntennaState.
    Bottom: 3,
    ///   The Antenna will be facing to the Upper Left, this demonstrates a numeric value
    ///   of 4 when using the AntennaValue property of AntennaState.
    UpperLeft: 4,
    ///   The Antenna will be facing to the Upper Right, this demonstrates a numeric value
    ///   of 5 when using the AntennaValue property of AntennaState.
    UpperRight: 5,
    ///   The Antenna will be facing to the Bottom Left, this demonstrates a numeric value
    ///   of 6 when using the AntennaValue property of AntennaState.
    BottomLeft: 6,
    ///   The Antenna will be facing to the Bottom Right, this demonstrates a numeric value
    ///   of 7 when using the AntennaValue property of AntennaState.
    BottomRight: 7,
    ///   The Antenna will be facing Forward, this demonstrates a numeric value
    ///   of 8 when using the AntennaValue property of AntennaState.
    Forward: 8,
    ///   The Antenna will be facing Backward, this demonstrates a numeric value
    ///   of 9 when using the AntennaValue property of AntennaState.
    Backward: 9
}
