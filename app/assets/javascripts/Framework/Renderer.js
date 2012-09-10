var Renderer = Class.extend({
	init: function(parent, width, height, world){
		var self = this;
		this.Scene = sjs.Scene({parent: parent, w: width, h: height});


		this.Animations = {};
		for (var animation in AnimationIndexes)
    		this.Animations[animation] = this.InitializeAnimation(animation);

		this.Ticker = this.Scene.Ticker(function(ticker){

			if (self.Input.mousedown)
	        	self.SelectOrganism(self.Input.mouse.position.x, self.Input.mouse.position.y);

			self.DrawGrid();

			for (var organismId in self.World.Organisms)
				self.DrawOrganism(self.World.Organisms[organismId]);

			self.DrawTeleporter(self.World.Teleporter);

			for (var cycle in self.Cycles)
				self.Cycles[cycle].next(self.Ticker.lastTicksElapsed);
		});
		this.World= world;

		this.BackgroundLayer = this.Scene.Layer('background', {useCanvas: true});
		this.Layer = this.Scene.Layer('front', {useCanvas: true});
		this.Sprites = {};
		this.Cycles = {};
		this.InitializeTeleporterAnimation();
		this.Input  = this.Scene.Input();
		this.SelectedOrganismId = null;
    },
    SelectOrganism: function(x, y){
    	if (x < 0 || y < 0 || x >= this.World.WorldWidth || y >= this.World.WorldHeight)
    		return;

    	for (var organismId in this.World.Organisms)
    	{
    		var organism = this.World.Organisms[organismId];
    		var rectangle = new Rectangle(organism.State.Position.X-organism.State.Radius, organism.State.Position.Y-organism.State.Radius, organism.State.Radius*2, organism.State.Radius*2);
    		if (rectangle.Contains(new Point(x, y)))
    		{
    			this.SelectedOrganismId = organism.Id;
		    	$(window).trigger("log-channel", [organism.Id]);
    			return;
    		}
    	}
    	this.SelectedOrganismId = null;
    	$(window).trigger("log-channel", ["General"]);
    },
    InitializeAnimation: function(animation)
    {
    	var animationContainer = {};
    	for (var direction in DirectionIndexes)
    		animationContainer[direction] = this.InitializeFramesInOneDirection(AnimationIndexes[animation], DirectionIndexes[direction], animation == AnimationIndexes.NoAction);
    	return animationContainer;
    },
    InitializeFramesInOneDirection: function(animationIndex, directionIndex, onlyOneFrame)
    {
    	var direction = {};

    	var size = 24;
    	var frames = [];
		var nbFrames = nbFrames ? 1 : 10;  

    	for (var i = 0; i < nbFrames; i++)
    		frames.push([i*size, animationIndex*size*8+directionIndex*size, 5]);
    	direction[size] = frames;

    	size = 48;
    	frames = [];
    	for (var i = 0; i < nbFrames; i++)
    		frames.push([i*size, animationIndex*size*8+directionIndex*size, 5]);
    	direction[size] = frames;

    	return direction;
    },
	Start: function(){
		this.Ticker.run();
	},
	DrawGrid: function(){
		var self = this;
		var ctx = self.BackgroundLayer.ctx;

		for (var i = 1; i < self.World.GridWidth; i++)
			this.DrawLine(ctx, 'DarkGreen', i * EngineSettings.GridCellWidth, 0, i * EngineSettings.GridCellWidth, self.World.WorldHeight);
		for (var i = 1; i < self.World.GridHeight; i++)
			this.DrawLine(ctx, 'DarkGreen', 0, i * EngineSettings.GridCellHeight, self.World.WorldWidth, i * EngineSettings.GridCellHeight);

		for (var i = 0; i < self.World.GridWidth; i++)
			for (var j = 0; j < self.World.GridHeight; j++)
			{
				var organism = self.World._cellOrganisms[i][j];
				if (organism != null)
				{
					ctx.fillStyle = 'DarkGreen';
					ctx.fillRect(i * EngineSettings.GridCellWidth, j * EngineSettings.GridCellHeight, EngineSettings.GridCellWidth, EngineSettings.GridCellHeight);
				}
			}
		
	},
	DrawLine: function(ctx, strokeStyle, x, y, x2, y2)
	{
		var previousStyle = ctx.strokeStyle;
	    ctx.strokeStyle = strokeStyle;
		ctx.beginPath();
	    ctx.moveTo(x, y);
	    ctx.lineTo(x2, y2);
	    ctx.closePath();
	    ctx.stroke();
	    ctx.strokeStyle = previousStyle;
	},
	DrawTeleporter: function(){
		this.TeleporterSprite.position(this.World.Teleporter.Rectangle.Location.X, this.World.Teleporter.Rectangle.Location.Y);
		this.TeleporterSprite.move(1, 0);
		this.TeleporterSprite.update();
	},
	DrawOrganism: function(organism){
		var ctx = this.Layer.ctx;
		var organismSprite = this.Sprites[organism.Id];
		if (organism.State.Radius >= 17 && organismSprite.w != 48)
		{
			organismSprite.remove();
			organismSprite = this.AddOrganism(organism);
		}

		var positionX = organism.State.Position.X - organismSprite.w/2;
		var positionY = organism.State.Position.Y - organismSprite.h/2;
		
		organismSprite.position(positionX, positionY);
		organismSprite.move(1, 0);
		organismSprite.update();

		var radiusW = EngineSettings.GridCellWidth * organism.State.CellRadius();
		var radiusH = EngineSettings.GridCellHeight * organism.State.CellRadius();

		// Draw name
		ctx.strokeStyle = "Black";
		ctx.strokeText(organism.State.Species.Name + " #" + organism.Id, positionX, positionY + organismSprite.h + 15);
	
		// Draw energy left
		var energy = organism.State.StoredEnergy() * organismSprite.w / organism.State.MaxEnergy();
		ctx.fillStyle = "green";
		ctx.fillRect(positionX, positionY + organismSprite.h + 1, energy, 5);
		ctx.fillStyle = "red";
		ctx.fillRect(positionX + energy, positionY + organismSprite.h + 1, organismSprite.w - energy, 5);

		// 
		if (this.SelectedOrganismId == organism.Id)
		{
			ctx.strokeStyle = "Red";
			ctx.strokeRect((organism.State.GridX()-organism.State.CellRadius()) * EngineSettings.GridCellWidth, (organism.State.GridY()-organism.State.CellRadius()) * EngineSettings.GridCellHeight, radiusW*2/*+EngineSettings.GridCellWidth*/, radiusH*2/*+EngineSettings.GridCellHeight*/);

			ctx.strokeStyle = "White";
			ctx.strokeRect((organism.State.GridX()-organism.State.Species.EyeSightRadius()) * EngineSettings.GridCellWidth, (organism.State.GridY()-organism.State.Species.EyeSightRadius()) * EngineSettings.GridCellHeight, (organism.State.Species.EyeSightRadius() * EngineSettings.GridCellWidth)*2/*+EngineSettings.GridCellWidth*/, (organism.State.Species.EyeSightRadius() * EngineSettings.GridCellHeight)*2/*+EngineSettings.GridCellHeight*/);
		}

		ctx.fillStyle = "black";

		// pick the right animation, if not plant
		if (!organism.State.IsPlant())
		{
			if (this.SelectedOrganismId == organism.Id && organism.State.IsAlive() && organism.IsMoving())
			{
				// Draw destination line
				this.DrawLine(ctx, "White", organism.State.Position.X, organism.State.Position.Y, organism.CurrentMoveToAction().MoveTo.Destination.X, organism.CurrentMoveToAction().MoveTo.Destination.Y); 
			}

			var displayAction = organism.DisplayAction();
			if (organismSprite.LastDisplayAction != displayAction || organismSprite.LastDirection != organism.Direction)
			{
				delete this.Cycles[organism.Id];
				var loop = displayAction != DisplayAction.Die && displayAction != DisplayAction.Nothing;

				this.Cycles[organism.Id] = this.Scene.Cycle(this.Animations[displayAction][organism.Direction][organismSprite.w]);
				this.Cycles[organism.Id].repeat = loop;
				this.Cycles[organism.Id].addSprite(organismSprite);

				organismSprite.LastDisplayAction = displayAction;
				organismSprite.LastDirection = organism.Direction;					
			}
		}

	},
	CreateSprite: function(organism){
		var size = organism.State.Radius < 17 ? 24 : 48;
		var spriteUrl = '/assets/' + organism.State.Species.Skin + size + '.png';
		var sprite = this.Scene.Sprite(spriteUrl, this.Layer);
		sprite.size(size, size);
		return sprite;
	},
	InitializeTeleporterAnimation: function(){
		var sprite = this.Scene.Sprite('/assets/teleporter.png', this.Layer);
		sprite.size(48, 48);
		this.TeleporterSprite = sprite;
		var frames = [];
    	for (var i = 0; i < 16; i++)
    		frames.push([i*48, 0, 5]);
		var cycle = this.Scene.Cycle(frames);
		cycle.addSprite(sprite);
		this.Cycles['teleporter'] = cycle;
	},
	AddOrganism: function(organism){
		var sprite = this.CreateSprite(organism);
		this.Sprites[organism.Id] = sprite;
		return sprite;
	},
	RemoveOrganism: function(organism){
		delete this.Sprites[organism.Id];
		delete this.Cycles[organism.Id];
	}

});
