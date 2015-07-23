var logger = require('../logger.js');

var handle404 = function(req, res){
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.end('Not Found Page!\n');
	logger.info(req.headers['host'] + req.method + req.url);
}

exports.handle404 = handle404;