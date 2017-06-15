var fs = require('fs');
var express = require('express'),
    router = express.Router();

    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));

        router.use('/' + name,require('./'+name ));
    });

module.exports = router;
