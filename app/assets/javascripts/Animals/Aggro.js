// WORK IN PROGRESS
// Was ported from .NET
// Code is really dirty...

// 1. Set the species attributes
var species = new Species();
species.Name = "aggro43";
species.Skin = AnimalSkin.ant; // ant, beetle, inchworm, scorpion or spider
species.MatureSize = 25; // between 24 and 48
species.IsCarnivore = false;

// Sum should equal to 100.
species.PercentOfMaximumEnergyPerUnitRadius = 8;
species.PercentOfMaximumEatingSpeedPerUnitOfRadius = 0;
species.PercentOfMaximumAttackDamagePerUnitRadius = 20;
species.PercentOfMaximumDefendDamagePerUnitRadius = 8;
species.PercentOfMaximumEyeSightRadius = 40;
species.PercentOfMaximumSpeed = 24;
species.PercentOfMaximumInvisibleOdds = 0;

var me = new AnimalMind(species);
me.food = null;
me.challenger = null;
me.dist_warning = 60000; // todo
me.limit_eating = 0.92;
me.better_go_there = 20; // todo
me.random_speed = 5;
me.nb_childs = 0;
me.limit_child_attack = 1;
me.hold_on = false;
me.blocking = null;
me.randoming = false;
me.limit_injured_attack = 0.5;
me.limit_injured_defend = 0.9;
me.contourning = false;
me.LastDestination = null;

me.OnMoveCompleted = function(reason, blockerId)
{
  this.contourning = false;
  this.randoming = false;
  this.hold_on = false;

  if(reason == ReasonForStop.Blocked && blockerId)
  {
    this.gere_blocked(blockerId);
  }
};
me.gere_blocked = function(blockerId)
{
  var blockingOrganism = this.LookFor(blockerId);
  if (!blockingOrganism.IsPlant())
  {
    if (blocking && blocking.Id == blockingOrganism.Id)
    {
      if (this.IsMoving())
        this.StopMoving();
      this.my_attack(blockingOrganism, false);
      this.hold_on = true;
      return;
    }

    if (blockingOrganism.IsAlive() && 
      !this.IsMySpecies(blockingOrganism) &&
      this.nb_childs >= this.limit_child_attack &&
      this.State.PercentInjured() < this.limit_injured_attack)
    {
      this.blocking = this.blockingOrganism;
      var spe = this.blocking.Species;
      if (!spe.IsCarnivore)
      {
        if (this.State.EnergyState() <= EnergyState.Hungry)
        {
          if (this.IsMoving())
            this.StopMoving();
          this.hold_on = true;
          this.my_attack(this.blocking, false);
          return;
        }
        else
        {
          this.contourne();
          return;
        }
      }
      else
      {
          this.hold_on = false;
          return;
      }
    }
    else
    {
      this.contourne();
      return;
    }
  } // is plant
  else
  {
    if (this.IsMoving())
      this.StopMoving();
    this.hold_on = false;
    return;
  }
  this.contourne();
};
me.contourne = function()
{
  var originalDestination = this.LastDestination;
  var originalVector = originalDestination.Subtract(this.State.Position);
  var newVector = originalVector.Rotate(Math.PI / 4);
  var unitVector = newVector.GetUnitVector();
  var newPositionVector = unitVector.Scale(20);
  var newPosition = this.State.Position.Add(newPositionVector);

  this.contourning = true;
  this.hold_on = true;
  this.LastDestination = newPosition;
  this.BeginMoving(new MovementVector(newPosition, this.random_speed));
};

me.OnIdle = function()
{
  this.WriteTrace("OnIdle.");
  
  var escaping = false;
  if (this.CanReproduce())
    this.gere_reproduction();
  
  this.WriteTrace("Just before world analysis.");
  this.analyse_world();
  this.WriteTrace("World analysed.");
  if (this.food != null)
  {
    this.gere_food(escaping);
    this.randoming = false;
    return;
  }

  if (this.hold_on || escaping)
    return;
  
  if (this.challenger != null &&
      this.nb_childs >= this.limit_child_attack &&
      this.State.PercentInjured() < this.limit_injured_attack &&
      this.State.EnergyState() <= EnergyState.Hungry) // stupid !
    {
      this.gere_challenger();
      this.randoming = false;
      return;
    }

  if (!this.randoming)
    this.move_to_a_random_place();
  this.randoming = true;
};

me.gere_challenger = function()
{
  if (this.WithinAttackingRange(this.challenger))
  {
    if (this.IsMoving())
      this.StopMoving();
    this.hold_on = true;
    this.my_attack(this.challenger, false);
  }
  else
  {
    this.move_to_challenger();
    this.my_attack(this.challenger, false);
  }
};

me.gere_blocking_annimal = function()
{
  if (this.WithinAttackingRange(this.blocking) && this.blocking.IsAlive())
  {
    if (this.IsMoving())
      this.StopMoving();
    this.hold_on = true;
    this.my_attack(this.blocking, false);
  }
  else
  {
    if (this.blocking.IsAlive())
    {
      this.challenger = this.blocking;
      this.move_to_challenger();
      this.my_attack(this.challenger, false);
    }
    else
    {
      this.hold_on = false;
      this.blocking = null;
    }
  }
};

me.gere_food = function(escaping)
{
  if (this.WithinEatingRange(this.food))
  {
    if (this.hold_on|| this.escaping)
    {
      if (this.CanEat())
        this.BeginEating(food);
      return;
    }
    if ((this.food.PercentInjured() < this.limit_eating || this.State.EnergyState() == EnergyState.Deterioration) &&
    this.CanEat())
    {
      if (this.IsMoving())
        this.StopMoving();
      if (this.challenger != null && this.State.EnergyState() >= EnergyState.Normal)
        this.BeginDefending(this.challenger);
      this.BeginEating(this.food);
    }
    else
    {
      if (this.challenger != null && this.State.EnergyState() >= EnergyState.Normal)
        this.BeginDefending(this.challenger);        
    }
    return;
  }
  if (!this.hold_on && !this.escaping)
    this.move_to_food();
};

me.gere_reproduction = function()
{
  this.BeginReproduction(null);
}

me.move_to_challenger = function()
{
  // todo: ne pas se deplacer vers le centre mais seulement vers le bord

  var speed = 0;

  switch (this.State.EnergyState())
  {
    case EnergyState.Full:
      speed = this.Species.MaximumSpeed();
      break;
    case EnergyState.Normal:
      speed = this.Species.MaximumSpeed() * 0.7;
      break;
    case EnergyState.Hungry:
      speed = this.Species.MaximumSpeed() * 0.4;
      break;
    default:
      speed = this.Species.MaximumSpeed() * 0.2;
      break;
  }
  this.BeginMoving(new MovementVector(this.challenger.Position, Math.round(speed)));
};

me.move_to_food = function()
{
  // todo: ne pas se deplacer vers le centre mais seulement vers le bord
  this.BeginMoving(new MovementVector(this.food.Position, this.Species.MaximumSpeed()));   
};

me.move_to_a_random_place = function()
{
  var X = MathUtils.RandomBetween(0, this.World.WorldWidth - 1);
  var Y = MathUtils.RandomBetween(0, this.World.WorldHeight - 1);

  this.BeginMoving(new MovementVector(new Point(X,Y), this.random_speed));
};

me.analyse_world = function()
{
  var creatures = this.State.SeenOrganisms;
  var plants = [];
  var animals = []; 
  var herbivors = [];
  var carnivors = [];

  for (var i = 0; i < creatures.length; i++)
  {
    var organism = creatures[i];
    if (organism.IsPlant())
      plants.push(organism);
    else
    {
      animals.push(organism);
      var spe = organism.Species;

      if (!spe.IsCarnivore)
      {
        if (!this.IsMySpecies(organism))
          herbivors.push(organism);
      }
      else
        carnivors.push(organism);
    }
  }
  this.select_carnivor(carnivors);
  this.select_plant(plants);
  this.select_herbivor(herbivors);
};

me.select_carnivor = function(carnivors)
{
  var minDistance = 9999;
  for (var i = 0; i < carnivors.length; i++)
  {
    if (carnivors[i].IsAlive())
    {
      var distance = this.State.Position.DistanceWith(carnivors[i].Position);
      if (distance < minDistance)
      {
        this.satanas = carnivors[i];
        minDistance = distance;
      }
    }
  }
};

me.select_herbivor = function(herbivors)
{
  var minDistance = 9999;
  var injured = 0;

  for(var i = 0; i < herbivors.length; i++)
  {
    if (!herbivors[i].IsAlive())
      continue;

    var herbivor = herbivors[i];
    var distance = this.State.Position.DistanceWith(herbivor.Position);
    if (distance < minDistance || (herbivor.PercentInjured() > injured && distance < this.better_go_there))
    {
      this.challenger = herbivor;
      minDistance = distance;
      injured = herbivor.PercentInjured();
    }
  }
};

me.select_plant = function(plants)
{
  var minDistance = 9999;
  for (var i = 0; i < plants.length; i++)
  {
    var plant = plants[i];
    var distance = this.State.Position.DistanceWith(plant.Position);
    if (distance < minDistance)
    {
      this.food = plant;
      minDistance = distance;
    }
  }
};

me.Attacked = function(attackerId)
{
  var attacker = this.LookFor(attackerId);
  var spe = attacker.Species;
  
  if (!spe.IsCarnivore)
    this.blocking = attacker;
  
  if(attacker.IsAlive())
  {
    this.hold_on = true;
    if (this.IsMoving())
      this.StopMoving();
    if (this.WithinAttackingRange(attacker))
      this.my_attack(attacker, true);
    else
    {
      if (this.State.PercentInjured() < this.limit_injured_defend)
      {
        // turning bad
        // would be good to escape
      }
      this.my_attack(attacker, true);
      this.BeginMoving(new MovementVector(attacker.Position, this.Species.MaximumSpeed));
    }
  }
};

me.ReproduceCompleted = function()
{
  this.nb_childs++;
};

me.my_attack = function(target, force_attack)
{
  this.BeginDefending(target);
  if (!force_attack)
  {
    if (this.State.EnergyState() <= EnergyState.Hungry)
      this.BeginAttacking(target);
  }
  else
    this.BeginAttacking(target);    
};

me.CalculateSpeed = function(target, max)
{
  var possibleSpeed = 0;

  if (target == null)
    return 2;
  
  possibleSpeed = this.Species.MaximumSpeed();
  while (this.possibleSpeed > 2 &&
     this.State.EnergyRequiredToMove(this.State.Position.DistanceWith(target.Position), possibleSpeed) > max)
    possibleSpeed /= 2;
  possibleSpeed /= 2;
  if (possibleSpeed < 2)
    possibleSpeed = 2;
  return possibleSpeed;
};

