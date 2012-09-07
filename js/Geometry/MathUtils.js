// utility functions
var MathUtils = {
	RandomBetween: function(n1, n2)
	{
		return Math.floor(Math.random() * (n2-1)) + n1;
	},
	degree2radian: function(a) {
		return a * (Math.PI/180); 
	},
	distance: function(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2));
	},
	is_point_in_square: function(x1,y1, x2, y2, width, height) {
		if(
			(x1>=x2) &&
			(x1<=(x2+width)) &&
			(y1>=y2) &&
			(y1<=(y2+height))
		) {
			return true;
		} else {
			return false;
		}
	}, 
};