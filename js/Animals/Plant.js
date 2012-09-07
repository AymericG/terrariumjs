importScripts('../Dependencies.js');

var species = new Species();
species.IsPlant = true;
species.Name = "Fig tree";
species.MatureRadius = 12;
species.Skin = PlantSkin.planttwo;

var organism = new OrganismMind(species);
organism.OnIdle = function(){
	if (this.CanReproduce())
		this.BeginReproduction(null);
};
