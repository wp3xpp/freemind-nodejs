var url = require('url');
var querystring = require('querystring');
var query = querystring.parse(url.parse(req.url).query); //一种获得查询字符串的方法
var query = url.parse(req.url, true).query; //更简洁的获得查询字符串的方法

var delQueryString = function(req, res){
	req.query = url.parse(req.url, true).query; //将查询字符串挂载在req上 
	handles(req, res);
};