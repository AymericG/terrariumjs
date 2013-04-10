me.OnAttacked = function (attackedId){

	this.WriteTrace("I am being attacked! I see " + this.State.SeenOrganisms.length + " potential enemie(s).");	
	var target = this.LookFor(attackedId);
	if (target != null)
	{
		this.WriteTrace("Defending...");
		this.BeginDefending(target);
	}
};