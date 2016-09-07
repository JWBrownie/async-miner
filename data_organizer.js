var util = require('util');
var fs = require('fs');

var links = null;

fs.readFile('doctores.json', 'utf8', function(err, data){
	if (err) throw err;
	links = JSON.parse(data);
	var links_az = links.sort( function(a, b){
		if( a < b )
			return 1;
		if( a > b )
			return -1;
		return 0;
	});

	fs.appendFile('doctors_za.json', JSON.stringify(links_az, null, 4), function(err){
		if(err) throw err;
		console.log( 'finished' );
	});
});