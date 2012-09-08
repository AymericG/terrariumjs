importScripts('../Dependencies.js');

var species = new Species();
species.MatureRadius = 24;
species.Name = "Buggy bug";
var organism = new AnimalMind(species);

// Buggy bug
organism.OnIdle = function() {
	throw new Exception();
};
