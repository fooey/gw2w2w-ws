"use strict"



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
    return this.toUtcTimeStamp(Date.now());
};