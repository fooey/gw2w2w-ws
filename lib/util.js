
module.exports = {

    toUtcTimeStamp: function(inTime){
        return Math.floor(new Date(inTime).getTime() / 1000);
    },

};