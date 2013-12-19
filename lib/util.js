"use strict"
const _ = require('lodash');


/*
*
*   DEFINE EXPORT
*
*/


var UtilLib = {};
module.exports = UtilLib;



/*
*
*   PUBLIC METHODS
*
*/

UtilLib.toUtcTimeStamp = function(inTime){
    return Math.floor(new Date(inTime).getTime() / 1000);
};



UtilLib.now = function () {
    return Math.floor(_.now() / 1000);
};



UtilLib.ensureArray = function (val) {
    return (_.isArray(val)) ? val : [val];
};
