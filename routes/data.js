var data = require('../lib/data.js');


module.exports.updateData = function (req, res) {
    data.init(req, res)

    data.updateData();

    res.send(GLOBAL.GW2.timeStamps);
};