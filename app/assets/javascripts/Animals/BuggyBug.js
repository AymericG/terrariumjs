var species = new Species();
species.MatureSize = 48;
species.Name = "Buggy bug";
var organism = new AnimalMind(species);

// Buggy bug
organism.OnIdle = function() {
	throw new Exception();
};
