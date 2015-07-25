var http = require('http');
var logger = require('./logger.js');
var app = require('./router.js').app;
var dispatch = require('./router.js').dispatch;
var middlewares = require('./middlewares/middlewares.js');
var render = require('./render.js');


var test2 = function(req, res, next){
	
	res.end("It's ok la \n");
	next();
}

var addRoutes = function(){
	app.use(middlewares.getQueryString);
	app.use('/static/*', middlewares.staticFile);
	app.get('/haha', test2);
}
addRoutes(); 
var awesomeServer = http.createServer(function(req, res){
	app.use('/', render(res, 'index.html',{}));
});
awesomeServer.listen(8000, '127.0.0.1');
logger.info('Server running at http://127.0.0.1');

awesomeServer.on('request', function(req, res){
	logger.info(req.headers['host'] + ' ' + req.method + ' ' + req.url);
	dispatch(req, res); //分发请求
})

awesomeServer.on('close', function(){
	logger.info('SERVER CLOSED');
})


