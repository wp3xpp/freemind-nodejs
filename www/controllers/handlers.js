var logger = require('../logger.js');

var handle404 = function(req, res){
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.end('404 Not Found!\n');
}


exports.handle404 = handle404;