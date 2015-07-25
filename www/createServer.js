var http = require('http');
var logger = require('./logger.js');
var app = require('./restful.js').app;
var dispatch = require('./restful.js').dispatch;

var test = function(req, res, next){
	next = next || null;
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("It's ok\n");
	next();
	
}
var test2 = function(req, res, next){
	next = next || null;
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("It's ok la \n");
	next();
}
var alertTest = function(req, res, next){
	res.end("<script>alert('hehe')</script>");
}
var addRoutes = function(){
	app.use('/', test);
	app.get('/haha', test2, alertTest);
}
addRoutes(); 
var awesomeServer = http.createServer();
awesomeServer.listen(8000, '127.0.0.1');
logger.info('Server running at http://127.0.0.1');

awesomeServer.on('request', function(req, res){
	logger.info(req.headers['host'] + ' ' + req.method + ' ' + req.url);
	dispatch(req, res); //分发请求
})

awesomeServer.on('close', function(){
	logger.info('AWESOMESERVER CLOSED');
})
awesomeServer.close();

