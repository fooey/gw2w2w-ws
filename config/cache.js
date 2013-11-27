var  path = require('path');
var cacheRoot = path.join(GLOBAL.appRoot, '/cache');


module.exports = {
	cacheFolder: cacheRoot,
	worlds: {
        maxAgeInSeconds: (60*60*24),
        filePath: path.join(cacheRoot, 'worlds.json')
    },
    worlds: {
        maxAgeInSeconds: (60*60*24),
        filePath: path.join(cacheRoot, 'worlds.json')
    },
    objectives: {
        maxAgeInSeconds: (60*60*24),
        filePath: path.join(cacheRoot, 'objectives.json')
    },
    matches: {
        maxAgeInSeconds: (60*60*24),
        filePath: path.join(cacheRoot, 'matches.json')
    },
    matchesDetails: {
        maxAgeInSeconds: (2)
    }
};
