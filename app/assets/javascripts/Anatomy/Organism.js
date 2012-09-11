// TODO: extract an Animal and Plant class from this base class 
var Organism = ClassWithEvents.extend({

	init: function(id, mindUrl, mindCode, world){

		this._super();
		this.Id = id;
		this.InProgressActions = new PendingActions();
		this.Nerve = new BodyNerve(this, mindUrl, mindCode);
		this.MindUrl = mindUrl;
		this.MindCode = mindCode;
		this.Direction = Direction.Left;
		this.World = world;
		var self = this;

		this.Subscribe("Disappear", function()
		{
			self.Nerve.MindThread.terminate();
		});
	},
	InitializeState: function(speciesData)
	{
		var species = new Species();
		species.Refresh(speciesData);
		species.Validate();

		if (speciesData.IsPlant)
			this.State = new PlantState(species);
		else
			this.State = new AnimalState(species);
		this.State.Id = this.Id;
	},
	DisplayAction: function(){
		if (!this.State.IsAlive())
			return DisplayAction.Die;

		if (this.IsAttacking())
			return DisplayAction.Attack;

		if (this.IsEating())
			return DisplayAction.Eat;

		if (this.IsMoving())
			return DisplayAction.Move;

		return DisplayAction.Nothing;   
	},
	IsIncubating: function(){
		return this.InProgressActions.ReproduceAction != null;
	},
	IsAttacking: function(){
		return this.InProgressActions.AttackAction != null;
	},
	IsMoving: function(){
		return this.InProgressActions.MoveToAction != null;
	},
	IsEating: function(){
		return this.InProgressActions.EatAction != null;
	},
	Log: function(message){ $(window).trigger("log", [this.Id, message]); },
	Move: function(){

		if (!this.State.IsAlive() || !this.IsMoving())
			return;

		try
		{
			var validWayPoint = this.World.FindValidWayPoint(this.Id, this.State.CellRadius(), this.State.Position, this.CurrentMoveToAction().MoveTo.Destination);
			this.DoMove(validWayPoint);
		}
		catch (e)
		{
			this.Log("EXCEPTION IN MOVE(): " + e.message);
		}
	},
	DoMove: function(wayPoint)
	{
		var destination = wayPoint.Destination;
		if (destination == null)
		{
			this.InProgressActions.MoveToAction = null;
			this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached });
			return;
		}

		var vector = this.State.Position.Substract(destination);
		var fullVector = this.State.Position.Substract(this.CurrentMoveToAction().MoveTo.Destination);

		if (fullVector.Magnitude() <= this.CurrentMoveToAction().MoveTo.Speed || (vector.X == 0 && vector.Y == 0))
        {
			this.InProgressActions.MoveToAction = null;
			this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached });
			return;
		}

		var moveVector = destination.Substract(this.State.Position);
		var unitVector = fullVector.GetUnitVector();
		var speedVector = unitVector.Scale(this.CurrentMoveToAction().MoveTo.Speed);
		
		if (speedVector.X*speedVector.X >= vector.X*vector.X && speedVector.Y*speedVector.Y >= vector.Y*vector.Y)
			speedVector = vector;
		
		this.Direction = this.DirectionFromVector(vector);
		this.World.FillCells(this.State, true);
	    this.State.Position = this.State.Position.Add(speedVector);
		this.World.FillCells(this.State, false);
		this.State.BurnEnergy(this.State.EnergyRequiredToMove(moveVector.Magnitude(), this.CurrentMoveToAction().MoveTo.Speed));
		if (!this.State.IsAlive())
			return;

		if (this.CurrentMoveToAction().MoveTo.Destination.EqualsTo(this.State.Position))
	    {
	       // Destination reached
			this.InProgressActions.MoveToAction = null;
	        this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.DestinationReached });
	    } else
	    {
	    	if (wayPoint.BlockerId)
	    	{
		       // Destination reached
				this.InProgressActions.MoveToAction = null;
		        this.Send({signal: Signals.MoveCompleted, ReasonForStop: ReasonForStop.Blocked, BlockerId: wayPoint.BlockerId });	    		
	    	}
	    }
	},
	DirectionFromVector: function(vector)
	{

		var direction = vector.ToAngleInDegrees();
		if (direction >= 68 && direction < 113)
			return Direction.Down;
		if (direction >= 113 && direction < 158)
			return Direction.DownLeft;
		if (direction >= 158 && direction < 203)
			return Direction.Left;
		if (direction >= 203 && direction < 248)
			return Direction.UpLeft;
		if (direction >= 248 && direction < 293)
			return Direction.Up;
		if (direction >= 293 && direction < 338)
			return Direction.UpRight;
		if (direction >= 338 && direction < 23)
			return Direction.Right;
		return Direction.DownRight;
	},
	Incubate: function(){
		if (!this.State.IsAlive() || this.InProgressActions.ReproduceAction == null || !this.State.ReadyToReproduce()) 
			return;
		
		if (this.State.IncubationTicks == EngineSettings.TicksToIncubate)
		{
	    	// raise event incubate for game to create copy.
	    	this.Trigger("Reproduce", this);
	    	
	    	this.Send({ signal: Signals.ReproduceCompleted });
			this.State.ResetReproductionWait();
	    	this.InProgressActions.ReproduceAction = null;
		}
		else 
		{
			if (this.State.EnergyState() >= EnergyState.Normal)
			{
				// Only incubate if the organism isn't hungry	    	
				this.State.BurnEnergy(this.State.Radius * EngineSettings.AnimalIncubationEnergyPerUnitOfRadius);
			    this.State.AddIncubationTick();
			}
		}
	},

	Age: function(){

		if (this.State.IsAlive())
		{
			this.State.AddTickToAge();

            if (!this.State.IsPlant())
            {
				if (this.State.IsAlive())
	                this.State.BurnEnergy(this.State.Radius * EngineSettings.BaseAnimalEnergyPerUnitOfRadius);
            } 
			else
            {
				if (this.State.IsAlive())
                    this.State.BurnEnergy(this.State.Radius * EngineSettings.BasePlantEnergyPerUnitOfRadius);

                // When plants die they disappear
                if (this.State.EnergyState() == EnergyState.Dead)
            		this.Trigger("Disappear", this);
            }
        }
        else
        {
            if (!this.State.IsPlant())
            {
                this.State.AddRotTick();
                if (this.State.RotTicks > EngineSettings.TimeToRot)
                {
                	this.Log("Disappear: End of rot");
            		this.Trigger("Disappear", this);
            	}
            }
        }

	},

	Grow: function(){
		if (this.State.CanGrow())
	    {
	    	if (this.World.WouldOnlyOverlapSelf(this.Id, this.State.GridX(), this.State.GridY(), this.State.CalculateCellRadius(this.State.Radius + 1)).Result)
	    	{
	    		// TODO: If we are blocked by something we should try to grow sideways 
		    	this.World.FillCells(this.State, true);
		    	this.State.Grow();
				this.World.FillCells(this.State, false);
			}
		}
	},

	Send: function(messageObject){
		this.Nerve.Send(messageObject);
	},

	Heal: function(){
		this.State.Heal();

	},
	Scan: function(){
		var foundOrganisms = this.World.FindOrganismsInView(this.State, this.State.Species.EyeSightRadius());
		var seen = [];
        
        // Remove any camouflaged animals
        for (var i = 0; i < foundOrganisms.length; i++)
        {
            var state = foundOrganisms[i];

			if (this.Id == state.Id)
				continue;

            // Dead animals aren't hidden
            if (!state.IsAlive())
            {
            	seen.push(state);
            	continue;
            }	
            var invisible = Math.random() * 100;
            if (invisible > state.Species.InvisibleOdds())
            {
            	seen.push(state);
                continue;
            }
        }

        // Put seen into State so that it gets serialized.
        this.State.SeenOrganisms = seen; 
        return seen;
	},
	CurrentMoveToAction: function(){
		return this.InProgressActions.MoveToAction;
	},
	CurrentAttackAction: function(){
		return this.InProgressActions.AttackAction;
	},
	CurrentDefendAction: function(){
		return this.InProgressActions.DefendAction;
	},
	Bite: function(){
		if (!this.State.IsAlive() || this.InProgressActions.EatAction == null)
			return;
		var attackerState = this.State;
		var defender = this.World.Organisms[this.InProgressActions.EatAction.TargetOrganismId];
		if (defender == null || typeof(defender) == 'undefined')
		{
			this.InProgressActions.EatAction = null;
			this.Send({ signal: "EatCompleted", BiteSuccessful: false});
			return;
		}
		var defenderState = defender.State;
	        
	    var energyToFill = Math.round((attackerState.Radius * attackerState.Species.MaximumEnergyPerUnitRadius()) - attackerState.StoredEnergy());
	    
	    // Determine how many chunks it would take to fill the animal completely
	    var foodChunkCount = 0;
	    if (defenderState.IsPlant())
	        foodChunkCount = energyToFill / EngineSettings.EnergyPerPlantFoodChunk;
	    else
	        foodChunkCount = energyToFill / EngineSettings.EnergyPerAnimalFoodChunk;
	    foodChunkCount = Math.floor(foodChunkCount);
	    if (foodChunkCount == 0)
	        foodChunkCount = 1;

	    // If this is more than the animal can eat in one bite, limit it to what they can eat
	    if (foodChunkCount > attackerState.Species.EatingSpeedPerUnitRadius() * attackerState.Radius)
	    	foodChunkCount = attackerState.Species.EatingSpeedPerUnitRadius() * attackerState.Radius;
		
		if (defenderState.FoodChunks <= foodChunkCount)
	    {
	        foodChunkCount = defenderState.FoodChunks;
	        // remove the defender from the world if we ate them all
			this.Log("Disappear: No food chunk left");
			defender.Trigger("Disappear", defender);
			this.InProgressActions.EatAction = null;
	    }
	    else
	    {
	    	defenderState.Log("Losing " + foodChunkCount + " food chunks");
	        // Shrink the meat or plant
	        defenderState.FoodChunks = defenderState.FoodChunks - foodChunkCount;
	    }

	    // Determine how much energy we got
	    var newEnergy = 0;
	    if (defenderState.IsPlant())
	        newEnergy = EngineSettings.EnergyPerPlantFoodChunk * foodChunkCount;
	    else
	        newEnergy = EngineSettings.EnergyPerAnimalFoodChunk * foodChunkCount;
	    //this.Log("Recovering energy (" + newEnergy + ")");
	    attackerState.StoredEnergy(attackerState.StoredEnergy() + newEnergy);
	},
	GetEnergyFromLight: function(){
		if (!this.State.IsPlant() || !this.State.IsAlive())
			return;
		var availableLight = this.World.GetAvailableLight(this.State);
		this.State.GiveEnergy(availableLight);
	},
	Attack: function(){
		var attackerState = this.State;
		if (!attackerState.IsAlive || this.CurrentAttackAction() == null)
			return;

		var defender = this.World.Organisms[this.CurrentAttackAction().TargetOrganismId];
		
		var damageCaused = 0;
		var escaped = false;
		var killed = false;

		var defenderState = defender.State;
		if (defender == null || !defenderState.IsAlive() || !attackerState.IsWithinRect(1, defenderState))
		{
			this.InProgressActions.AttackAction = null;
		    // They were killed and eaten before the attack occurred
		    escaped = true;
		}
		else
		{
            // Figure out the maximum possible attack damage
            damageCaused = MathUtils.RandomBetween(0, attackerState.Species.MaximumAttackDamagePerUnitRadius() * attackerState.Radius);

            //// Defense doesn't scale based on distance
            var defendAction = defender.CurrentDefendAction();
            var defendDiscount = 0;
            if (defendAction != null && defendAction.TargetOrganismId == attackerState.Id)
                defendDiscount = MathUtils.RandomBetween(0, defenderState.Species.MaximumDefendDamagePerUnitRadius * defenderState.Radius);
         
            if (damageCaused > defendDiscount)
            {
                damageCaused = damageCaused - defendDiscount;
                defenderState.CauseDamage(damageCaused);
            }
            else
                damageCaused = 0;

            killed = !defenderState.IsAlive();
            defender.Send({ signal: Signals.Attacked, AttackerId: this.Id });
		}

		// Tell the attacker what happened
		this.Send({
			signal: "AttackCompleted",
			Killed: killed,
			Escaped: escaped,
			DamageCaused: damageCaused
		});
	},
	Teleport: function(){
		if (this.State.IsPlant() || !this.State.IsAlive())
	    	return;

	    this.World.Teleporter.TeleportIfInside(this);
	}
});
