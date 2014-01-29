

module.exports = function (req, res) {
	"use strict";
	let dataType = req.params.dataType;

	const extension = req.params.extension;
	const id = req.params.id;

	if(dataType === 'worlds'){
		require('../lib/worlds').getWorlds(returnResults); 
	}
	else if(dataType === 'objectives'){
		require('../lib/objectives').getObjectives(returnResults); 
	}
	else if(dataType === 'objectiveGroups'){
		returnResults(null, require('../lib/objectiveGroups').getByObjective());
	}
	else if(dataType === 'objectiveGroupsLayout'){
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
		require('../lib/matchDetails').getById(id, returnResults); 
	}
	else if(dataType === 'state'){
		require('../lib/objectiveState').getById(id, returnResults); 
	}
	else if(dataType === 'guild'){
		dataType += ( 's.' + id );
		require('../lib/guilds').getById(id, returnResults);
	}
	else if(dataType === 'guilds'){
		//dataType += ( '.' + id );
		require('../lib/guilds').getByMatchId(id, returnResults);
	}
	else{
		res.status(404).send('Not found');
	}


	function returnResults(err, data){
		if(extension === 'json'){
			res.json(data);
		}
		else if(extension === 'js') {
			res.header("Content-Type", "application/javascript");
			res.send('window.gw2data.' + dataType + '=' + JSON.stringify(data));
		}
		else{
			res.status(404).send('Not found');
		}
	}

};