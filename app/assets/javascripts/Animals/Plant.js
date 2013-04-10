var species = new Species();
species.IsPlant = true;
species.Name = "Plant";
species.MatureSize = 48;
var RandomProperty = function(object){
	var result;
    var count = 0;
    for (var prop in object)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
};
species.Skin = PlantSkin[RandomProperty(PlantSkin)];

var organism = new OrganismMind(species);

organism.OnIdle = function(){
	if (this.CanReproduce())
		this.BeginReproduction(null);
};
