var species = new Species();
var organism = new AnimalMind(species);

function PickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}
species.Skin = AnimalSkin[PickRandomProperty(AnimalSkin)];

// Wandering Ghost
organism.OnIdle = function() {
	if (this.CanReproduce())
		this.BeginReproduction(null);

	if (!this.IsMoving())
		this.MoveToRandomPoint();
};

organism.MoveToRandomPoint = function(){
	// Pick random point on the map.
	var y = MathUtils.RandomBetween(0, this.World.WorldHeight);
	var x = MathUtils.RandomBetween(0, this.World.WorldWidth);

	this.BeginMoving(new MovementVector(new Point(x, y), 2));
};
