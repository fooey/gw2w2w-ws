var bean = function (parameters) {
    var self = this;

    /*
    *
    *  PUBLIC PROPERTIES
    *
    */

    self.id = parameters.id;
    self.type = parameters.type;
    self.value = parameters.value;



    /*
    *
    *  PUBLIC METHODS
    *
    */


    return self;
};

module.exports = bean;