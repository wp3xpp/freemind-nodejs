var http = require('http');
var logger = require('./logger.js');

http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(8000, '127.0.0.1');
logger.info('Server running at http://127.0.0.1');