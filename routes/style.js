module.exports = function (req, res) {
    var fs = require('fs');
    fs.readFile(process.cwd() + '/public/stylesheets/style.css', function (err, data) {
        //console.log(data)
        var CleanCSS = require('clean-css');
        var minimized = new CleanCSS().minify(data.toString());

        res.set('Content-Type', 'text/css');
        res.send(minimized)
    });


};