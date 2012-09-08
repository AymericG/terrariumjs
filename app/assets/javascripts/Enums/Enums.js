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

