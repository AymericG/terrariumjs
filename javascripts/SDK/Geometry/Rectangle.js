var Rectangle = function(left, top, width, height)
{
	this.Location = new Point(left, top);
	this.Width = width;
	this.Height = height;

	this.Contains = function(point)
	{
		var right = this.Location.X + this.Width;
		var bottom = this.Location.Y + this.Height;
		return ((this.Location.X <= point.X && point.X <= right) && (this.Location.Y <= point.Y && point.Y <= bottom));
	}

}