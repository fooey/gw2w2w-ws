var _ = require('lodash');

var bean = function (parameters) {
    var self = this;



    /*
    *
    *  PUBLIC PROPERTIES
    *
    */

    self.id = parameters.wvw_match_id;
    self.startTime = new Date(parameters.start_time);
    self.endTime = new Date(parameters.end_time);
    self.region = getRegion(self.id);
    
    self.redWorldId = parameters.red_world_id;
    self.blueWorldId = parameters.blue_world_id;
    self.greenWorldId = parameters.green_world_id;


    
    /*
    *
    *  PUBLIC METHODS
    *
    */
    self.getRedWorld = function(lang){
        return getWorld(lang, self.redWorldId);
    }

    self.getGreenWorld = function(lang){
        return getWorld(lang, self.greenWorldId);
    }

    self.getBlueWorld = function(lang){
        return getWorld(lang, self.blueWorldId);
    }



    /*
    *
    *  PRIVATE METHODS
    *
    */

    function getRegion (id){
        if(id.charAt(0) ===  '1') return 'US';
        if(id.charAt(0) ===  '2') return 'EU';
    }

    function getWorld(lang, worldId){
        return GLOBAL.data.worlds[lang][worldId];
    }


    return self;
};

module.exports = bean;





