var Renderer = Class.extend({
	init: function(parent, width, height, world){
		var self = this;
		this.Scene = sjs.Scene({parent: parent, w: width, h: height});

		this.Animations = {};
		for (var animation in AnimationIndexes)
    		this.Animations[animation] = this.InitializeAnimation(animation, 48);

		this.Ticker = this.Scene.Ticker(function(ticker){

			self.DrawGrid();

			for (var organismId in self.World.Organisms)
				self.DrawOrganism(self.World.Organisms[organismId]);

			for (var cycle in self.Cycles)
				self.Cycles[cycle].next(self.Ticker.lastTicksElapsed);
		});
		this.World= world;

		this.BackgroundLayer = this.Scene.Layer('background', {useCanvas: true});
		this.Layer = this.Scene.Layer('front', {useCanvas: true});
		this.Sprites = {};
		this.Cycles = {};
    },
    InitializeAnimation: function(animation, size)
    {
    	var animationContainer = {};
    	for (var direction in DirectionIndexes)
    		animationContainer[direction] = this.InitializeFramesInOneDirection(AnimationIndexes[animation], DirectionIndexes[direction], size);
    	return animationContainer;
    },
    InitializeFramesInOneDirection: function(animationIndex, directionIndex, size)
    {
    	var frames = [];
    	for (var i = 0; i < 10; i++)
    		frames.push([i*size, animationIndex*size*8+directionIndex*size, 5]);
    	return frames;
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
					ctx.fillStyle = '#000';
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
	DrawOrganism: function(organism){
		var ctx = this.Layer.ctx;
		var organismSprite = this.Sprites[organism.Id];
		if (organism.Radius == 48 && organismSprite.w != 48)
		{
			organismSprite.remove();
			organismSprite = this.AddOrganism(organism);
		}
		var radiusW = EngineSettings.GridCellWidth * organism.State.CellRadius();
		var radiusH = EngineSettings.GridCellHeight * organism.State.CellRadius();
		var positionX = organism.State.Position.X - organismSprite.w/2;
		var positionY = organism.State.Position.Y - organismSprite.h/2;
		
		organismSprite.position(positionX, positionY);
		organismSprite.move(1, 0);
		organismSprite.update();

		ctx.strokeStyle = "Blue";
		ctx.strokeRect(organism.State.GridX() * EngineSettings.GridCellWidth - radiusW, organism.State.GridY() * EngineSettings.GridCellHeight - radiusH, radiusW*2+EngineSettings.GridCellWidth, radiusH*2+EngineSettings.GridCellHeight);

		ctx.strokeStyle = "Black";
		ctx.strokeText("#" + organism.Id + " (radius: " + organism.State.Radius + ")", positionX, positionY + organismSprite.h + 15);
		var energy = organism.State.StoredEnergy() * organismSprite.w / organism.State.MaxEnergy();

		ctx.fillStyle = "green";
		ctx.fillRect(positionX, positionY + organismSprite.h + 1, energy, 5);
		ctx.fillStyle = "red";
		ctx.fillRect(positionX + energy, positionY + organismSprite.h + 1, organismSprite.w - energy, 5);

		ctx.strokeStyle = "White";
		ctx.strokeRect(organism.State.GridX() * EngineSettings.GridCellWidth - radiusW, organism.State.GridY() * EngineSettings.GridCellHeight - radiusH, radiusW*2+EngineSettings.GridCellWidth, radiusH*2+EngineSettings.GridCellHeight);

		ctx.fillStyle = "black";

		// pick the right animation, if not plant
		if (!organism.State.IsPlant())
		{
			if (organism.IsMoving())
			{
				this.DrawLine(ctx, "White", organism.State.Position.X, organism.State.Position.Y, organism.CurrentMoveToAction().MoveTo.Destination.X, organism.CurrentMoveToAction().MoveTo.Destination.Y); 
			}

			var displayAction = organism.DisplayAction();
			if (displayAction == DisplayAction.Nothing)
			{
				displayAction = DisplayAction.Die;
			}
			if (organismSprite.LastDisplayAction != displayAction || organismSprite.LastDirection != organism.Direction)
			{
				delete this.Cycles[organism.Id];
				var loop = displayAction != DisplayAction.Die;
				this.Cycles[organism.Id] = this.Scene.Cycle(this.Animations[displayAction][organism.Direction]);
				this.Cycles[organism.Id].repeat = loop;
				this.Cycles[organism.Id].addSprite(organismSprite);

				organismSprite.LastDisplayAction = displayAction;
				organismSprite.LastDirection = organism.Direction;					
			}
		}

	},
	CreateSprite: function(organism){
		var sprite = null
		if (organism.State.IsPlant())
		{
			var size = organism.State.Radius < 48 ? 24 : 48;
			sprite = this.Scene.Sprite('img/' + organism.State.Species.Skin + size + '.bmp', this.Layer);
			sprite.size(24, 24);
		}
		else
		{			
			sprite = this.Scene.Sprite('img/ant48.bmp', this.Layer);
			sprite.size(48, 48);
		}
		return sprite;
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
