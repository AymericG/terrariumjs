describe("World", function() {
  var world;
  var me;

  function FillCells(world, organism, position, cellRadius)
  {
      for (var i = position.X-cellRadius; i < position.X+cellRadius; i++)
        for (var j = position.Y-cellRadius; j < position.Y+cellRadius; j++)
          world._cellOrganisms[i][j] = organism;
  }

  describe("when using small critters", function() {
    beforeEach(function() {
      world = new World(8*8, 8*8, null);
      
      me = { Id: 2 };
    });

    it("when going on a straight line it should be blocked", function() {

      var enemy = { Id: 1 };
      FillCells(world, enemy, new Point(4, 1), 1);
      FillCells(world, me, new Point(1, 1), 1);

      var wayPoint = world.FindValidWayPoint(me.Id, 1, new Point(1*8, 1*8), new Point(7*8, 1*8));
      expect(wayPoint.Destination.X).toBe(2*8);
      expect(wayPoint.Destination.Y).toBe(1*8);
    });

    it("when going to an enemy, it should be blocked", function() {

      var enemy = { Id: 1 };
      FillCells(world, enemy, new Point(4, 1), 1);
      FillCells(world, me, new Point(1, 1), 1);

      var destination = world.FindValidWayPoint(me.Id, 1, new Point(1*8, 1*8), new Point(4*8, 1*8));
      expect(destination.Destination.X).toBe(2*8);
      expect(destination.Destination.Y).toBe(1*8);
    });

    it("when going to a bigger enemy on a straight line, it should be blocked", function() {

      var enemy = { Id: 1 };
      FillCells(world, enemy, new Point(5, 2), 2);
      FillCells(world, me, new Point(1, 2), 1);

      var destination = world.FindValidWayPoint(me.Id, 1, new Point(1*8, 2*8), new Point(4*8, 5*8));
      expect(destination.Destination.X).toBe(2*8);
      expect(destination.Destination.Y).toBe(3*8);
    });

  });

});