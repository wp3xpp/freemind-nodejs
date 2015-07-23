var http = require('http');
var logger = require('./logger.js');
var app = require('./restful.js').app;
var dispatch = require('./restful.js').dispatch;

var test = function(req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("It's ok\n");
}
var test2 = function(req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("It's ok la \n");
}
var init = function(){
	app.use('/', test);
	app.post('/haha', test2)
}
init(); 
http.createServer(function(req, res){
	//res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.end('Hello World\n');
	dispatch(req, res); //分发请求
}).listen(8000, '127.0.0.1');
logger.info('Server running at http://127.0.0.1');

