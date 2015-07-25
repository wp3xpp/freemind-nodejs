var logger = require('../logger.js');

var handle404 = function(req, res){
	res.writeHead(404, {'Content-Type': 'text/html; charset=utf8'});
	res.end('404 Not Found!\n');
}

var handle500 = function(req, res){
	res.writeHead(500, {'Content-Type': 'text/html; charset=utf8'});
	res.end('500 Internal server error!\n');
}


exports.handle404 = handle404;
exports.handle500 = handle500;