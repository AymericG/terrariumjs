importScripts('../Dependencies.js');

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

organism.MoveToRandomPoint = function(){
	// Pick random point on the map.
	var y = MathUtils.RandomBetween(0, this.World.WorldHeight);
	var x = MathUtils.RandomBetween(0, this.World.WorldWidth);

	this.BeginMoving(new MovementVector(new Point(x, y), 4));
};

// Herbie
organism.OnIdle = function() {

	if (!this.IsEating() && !this.IsMoving())
	{
		this.WriteTrace("Moving...");
		this.MoveToRandomPoint();
	}
	if (this.State.SeenOrganisms.length == 0)
		return;

	for (var i = 0; i < this.State.SeenOrganisms.length; i++)
	{
		var target = this.State.SeenOrganisms[i];
		if (target.IsPlant()){
			if (!this.IsEating() && this.CanEat() && this.WithinEatingRange(target))
			{
				this.WriteTrace("Eating...");
				this.StopMoving();
				this.BeginEating(target);
			}
		}
	}
};

organism.OnEatCompleted = function (){ 
// 	this.MoveToRandomPoint(); 
};

organism.OnMoveCompleted = function (){
	//	this.MoveToRandomPoint();
};







