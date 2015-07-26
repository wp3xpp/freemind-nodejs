var merge = require('merge-descriptors');
var http = require('http');
var EventEmitter = require('events').EventEmitter;

var res = {
  __proto__: http.ServerResponse.prototype
};

res.render = function render(){
	console.log('merge test is ok');
};

var app = {};

app.init = function init(){
	merge(app, http, false);
	merge(app, EventEmitter.prototype, false);
	app.response = { __proto__: res, app: app };
	//showFunctions(http);
	//console.log(http.hasOwnProperty('response'));
	return app;
};

app.defaultConfiguration = function defaultConfiguration(){

};

var showFunctions = function (object){
	Object.getOwnPropertyNames(object).forEach(function forEachOwnPropertyName(name) {
    	console.log(name);
	})

};


var test = app.init();
test.createServer(function(req, res){
	res.__proto__ = app.response;
	res.writeHead(200, 'text/html; charset=utf8');
	res.render();
	res.end('Server is ok');
}).listen(8888);
console.log('Server is running');
