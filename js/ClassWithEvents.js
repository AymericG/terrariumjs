var ClassWithEvents = Class.extend({
	init: function(){
        this.Handlers = {};
    },
	Subscribe : function(eventId, handler) {
        if (!this.Handlers[eventId])
        	this.Handlers[eventId] = [];
        this.Handlers[eventId].push(handler);
    },

    Unsubscribe : function(eventId, handler) {

        if (!this.Handlers[eventId])
        	return;
        this.Handlers[eventId] = this.Handlers[eventId].filter(function(x) { if (x !== handler) return x; });
    },

    Trigger : function(eventId, thisObj) {
        var scope = thisObj || window;
		if (!this.Handlers[eventId])
			return;

        this.Handlers[eventId].forEach(function(x) { x.call(scope); });
    }
});