var Point = function(x, y)
{
	this.X = x;
	this.Y = y;

	this.DistanceWith = function(x, y)
	{
		return MathUtils.distance(this.X, this.Y, x, y);
	};

	this.Magnitude = function()
    {
        var absX = (this.X < 0 ? -this.X : this.X);
        var absY = (this.Y < 0 ? -this.Y : this.Y);

        if (absX < absY)
            return absX + absY - absX/2;
        
        return absX + absY - absY/2;
    };

    this.Substract = function (point)
    {
		return new Point(point.X - this.X, point.Y - this.Y);
    }

    this.GetUnitVector = function(){
		var magnitude = this.Magnitude();
		return new Point(this.X / magnitude, this.Y / magnitude);

    };

    this.Add = function(vector)
    {
		return new Point(this.X + vector.X, this.Y + vector.Y);
    };

	this.Scale = function (scalar)
	{
		return new Point(Math.round(this.X * scalar), Math.round(this.Y * scalar));
	};

	this.ToAngleInDegrees = function(vector)
	{
		var unitVector = this.GetUnitVector();
        var angle = Math.acos(unitVector.X);
        if (unitVector.Y < 0)
            angle = 6.2831853 - angle;

        // convert radians to degrees
        return (angle/6.283185) * 360;
	};

    this.EqualsTo = function(point)
    {
        if (point == null)
            return false;
        return (this.X == point.X && this.Y == point.Y);
    };

    this.ToString = function()
    {
        return "(" + this.X + ", " + this.Y + ")";
    };

    this.DistanceWith = function(point)
    {
      var xs = 0;
      var ys = 0;
     
      xs = point.X - this.X;
      xs = xs * xs;
     
      ys = point.Y - this.Y;
      ys = ys * ys;
     
      return Math.sqrt(xs + ys);
    };
};