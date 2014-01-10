module.exports = function (req, res) {
	const dataType = req.params.dataType;
	const extension = req.params.extension;
	const matchId = req.params.matchId;

	if(dataType === 'worlds'){
		require('../lib/worlds').getWorlds(returnResults); 
	}
	else if(dataType === 'objectives'){
		require('../lib/objectives').getObjectives(returnResults); 
	}
	else if(dataType === 'objectiveGroups'){
		returnResults(null, require('../lib/objectiveGroups').getByMap());
	}
	else if(dataType === 'objectiveTypes'){
		returnResults(null, require('../lib/objectiveTypes').objectiveTypes);
	}
	else if(dataType === 'matches'){
		require('../lib/matches').getMatches(returnResults); 
	}
	else if(dataType === 'scores'){
		require('../lib/matchDetails').getScores(returnResults); 
	}
	else if(dataType === 'matchDetails'){
		data = require('../lib/matchDetails').getById(matchId, returnResults); 
	}
	else if(dataType === 'state'){
		data = require('../lib/objectiveState').getById(matchId, returnResults); 
	}
	else{
		res.status(404).send('Not found');
	}


	function returnResults(err, data){
		if(extension === 'json')
			res.json(data)
		else if(extension === 'js') 
			res.send(dataType + '=' + JSON.stringify(data) )
		else
			res.status(404).send('Not found');
	}

};