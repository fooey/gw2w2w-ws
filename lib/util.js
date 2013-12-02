
module.exports = {

	toUtcTimeStamp: function(inTime){
        return Math.floor(new Date(inTime).getTime() / 1000);
    },

    now: function () {
        return this.toUtcTimeStamp(Date.now());
    },

    randRange: function (rangeMin, rangeMax) {
        var randInRange = Math.round(
		    (
			    Math.random()
			    * (rangeMax - rangeMin)
		    )
		    + rangeMin
	    );
        return randInRange;
    }
    
};