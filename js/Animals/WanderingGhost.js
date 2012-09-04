importScripts('../Dependencies.js');

var species = new Species();
var organism = new AnimalMind(species);

organism.MoveToRandomPoint = function(){
	// Pick random point on the map.
	var y = MathUtils.RandomBetween(0, this.World.WorldHeight);
	var x = MathUtils.RandomBetween(0, this.World.WorldWidth);

	this.BeginMoving(new MovementVector(new Point(x, y), 2));
};

// Wandering Ghost
organism.OnIdle = function() {
	if (!this.IsMoving())
		this.MoveToRandomPoint();
};

organism.OnMoveCompleted = function (){
	this.MoveToRandomPoint();
};
