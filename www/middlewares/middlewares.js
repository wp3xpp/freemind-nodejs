var url = require('url');
var querystring = require('querystring');
var logger = require('../logger.js');
var fs = require('fs');
var path = require('path');

//中间件统一格式function(req, res, next){
//	TODO:
//	next();
//}

//查询字串中间件
var getQueryString = function(req, res, next){
	//var query = querystring.parse(url.parse(req.url).query); //一种获得查询字符串的方法
	//var query = url.parse(req.url, true).query; //更简洁的获得查询字符串的方法
	req.query = url.parse(req.url, true).query; //将查询字符串挂载在req上 
	next();
};

//cookie解析中间件
var cookie = function(req, res, next){
	var cookie = req.headers.cookie;
	var cookies = {};
	if(cookie){
		var list = cookie.split(';');
		for(var i=0;i < list.length; i++){
			var pair = list[i].split('=');
			cookies[pair[0].trim()] = pair[1];
		}
	}

	req.cookies = cookies;
	next();
};

//由于异步方法不能直接捕获，中间件异步产生的异常需要自己传递出来
//下面是session中间件的例子
var session = function(req, res, next){
	var id = req.cookies.sessionid;
	store.get(id, function(err, session){
		if(err){
			//将异常通过next()传递
			return next(err);
		}
		req.session = session;
		next();
	});
};

//如果app.use(staticFile);这样注册误伤率会太高
//应该使用app.use('/static', staticFile)类似方式注册提高效率
//静态文件加载中间件
var staticFile = function(req, res, next){
	var ROOT = './';
	var PATH = url.parse(req.url).pathname;
	var pathname = PATH.slice(PATH.lastIndexOf('static'));

	fs.readFile(path.join(ROOT, pathname), function(err, file){
		if(err){
			return next(err);
		}
		res.writeHead(200, 'text/html; charset=utf8');
		res.end(file);
		next();
	});
};


exports.getQueryString = getQueryString;
exports.cookie = cookie;
exports.session = session;
exports.staticFile = staticFile;