var slugify = require ('slug');


var bean = function (parameters) {
    var self = this;

    //console.log(arguments)



    /*
    *
    *  PUBLIC PROPERTIES
    *
    */
    //console.log(parameters)

    self.id = parameters.id;
    self.name = parameters.name;
    self.lang = parameters.lang;
    self.slug = slugify(self.name.toLowerCase()).replace('\'', '');
    self.link = getLink(self.lang, self.slug);
    self.region = getRegion(self.id);



    /*
    *
    *  PUBLIC METHODS
    *
    */



    /*
    *
    *  PRIVATE METHODS
    *
    */

    function getLink(lang, slug){
        var thisLink = ['/', lang, '/', slug].join('');
        return thisLink;
    };

    function getRegion(worldId){
        if(worldId >=  1000 && worldId < 2000) return 'US';
        if(worldId >=  2000 && worldId < 3000) return 'EU';
    };


    return self;
};

module.exports = bean;





