//通过Transfer-encoding Content-Length判断请求中是否带有内容
var hasBody = function(req){
	return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
};

//HTTP_Parser解析报头结束后，报文内容部分会用过data事件触发
function(req, res){
	if(hasBody(req)){
		var  buffers = [];
		req.on('data', function(chunk){
			buffers.push(chunk);
		});
		req.on('end', function(){
			req.rawBody = Buffer.concat(buffers).toString();
			handle(req, res);
		});
		else{
			handle(req, res);
		}
	}
}
//表单数据处理
//默认表单提交，请求头中的Content-Type字段值为application/x-www-form-urlencoded
//其报文内容跟查询字符串相同，可以按照处理查询字符串的方式处理
var handle = function(req, res){
	if(req.headers['content-type'] === 'application/x-www-form-urlencoded'){
		req.body = querystring.parse(req.rawBody);
	}
	todo(req, res);
};
//需要注意的是content-type可能附带如下编码信息: Content-Type: application/json; charset=utf-8
//所以做判断时要注意区分

var mime = function(req){
	var str = req.headers['content-type'] || '';
	return str.split(';')[0];
};

//以下为解析json和xml的方式
var handle = function(req, res){
	if(mime(req) === 'application/json'){
		try{
			req.body = JSON.parse(req.rawBody);
		}
		catch(e){
			//异常内容，响应Bad request
			res.writeHead(400);
			res.end('Invalid JSON');
			return;
		}
	}
	todo(req, res);
};

//解析xml要借助xml2js 模块
var xml2js = require('xml2js');

var handle = function(req, res){
	if(mime(req) === 'application/xml'){
		xml2js.parseString(req.rawBody, function(err, xml){
			if(err){
				//异常内容，响应Bad request
				res.writeHead(400);
				res.end('Invalid XML');
				return;
			}
			req.body = xml;
			todo(req, res);
		});
	}
};

//将流对象直接交给对应的解析方法
function(req, res){
	if(hasBody(req)){
		var done = function(){
			handle(req, res);
		};
		if(mime(req) === 'application/json'){
			parseJSON(req, done);
		}
		else if(mime(req) === 'application/xml'){
			parseXML(req, done);
		}
		else if(mime(req) === 'multipart/form-data'){
			parseMultipart(req, done);
		}
	}
	else{
		handle(req, res);
	}
}

//对于multipart/form-data类型，用formidable模块流式处理解析报文
var formidable = require("formidable");

function(req, res){
	if(hasBody(req)){
		if(mime(req) === 'multipart/form-data'){
			var form = new formidable.IncomingForm();
			form.parse(req, function(err, fields, files){
				req.body = fields;
				req.files = fields;
				handle(req, res);
			});
		}
	}
	else{
		handle(req, res);
	}
}