var url = require('url');
var querystring = require('querystring');
var logger = require('../logger.js');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var application = require('../freemind.js');

/**中间件统一格式
 *  exports.function(req, res, next){
 *		TODO:
 *	 	next();
 *	}
 */

//查询字串中间件
exports.getQueryString = function(req, res, next){
	//var query = querystring.parse(url.parse(req.url).query); //一种获得查询字符串的方法
	//var query = url.parse(req.url, true).query; //更简洁的获得查询字符串的方法
	req.query = url.parse(req.url, true).query; //将查询字符串挂载在req上 
	return next();
};

//cookie解析中间件
exports.cookie = function(req, res, next){
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
	return next();
};

//由于异步方法不能直接捕获，中间件异步产生的异常需要自己传递出来
//下面是session中间件的例子
exports.session = function(req, res, next){
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
exports.staticFile = function(req, res, next){
	var ROOT = './';
	var PATH = url.parse(req.url).pathname;
	var pathname = PATH.slice(PATH.lastIndexOf('static'));
	var contenType = mime.lookup(pathname);
	var isFont = /^static\/fonts\/.*$/g;
	if(isFont.test(pathname)){
		//字体文件需要用流形式传送
		res.sendfile(path.join(ROOT, pathname));
	}
	else{
		fs.readFile(path.join(ROOT, pathname), 'utf8', function(err, file){
		if(err){
			return next(err);
		}
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Content-Type", contenType +';charset=utf8');
		res.end(file);
		});
	}
	return next();
};

