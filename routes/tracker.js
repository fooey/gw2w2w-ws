
module.exports = function (req, res) {
    var lang = req.params.lang;
    var worldName = req.params.worldName;

    res.render('index', { title: lang + ' ' + worldName + ' Express' });
};