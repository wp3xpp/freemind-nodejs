//时间戳的方式实现缓存，有两点主要缺陷:
//1.文件的时间戳发生改变，但是内容不一定改变
//2.时间戳只能精确到秒级别，更新频繁的内容无法生效
var handle = function(req, res){
	fs.stat(filename, function(err, stat){
		var lastModified = stat.mtime.toUTCString();
		if(lastModified === req.headers['if-modified-since']){
			res.writeHead(304, "Not Modified");
			res.end();
		}
		else{
			fs.readFile(filename, function(err, file){
				var lastModified = stat.mtime.toUTCString();
				res.setHeader("Last-Modified", lastModified);
				res.writeHead(200,"OK");
				res.end(file);
			});
		}
	});
};
//ETag方式实现，Etag的内容有服务器端决定，可以是文件的hash值
//ETag的请求响应时if-None-Match/Etag
var crypto = require("crypto");
var getHash = function(str){
	var shasum = crypto.createHash('sha1');
	return shasum.update(str).digest('base64');
};

var handle = function(req, res){
	fs.readFile(filename, function(err, file){
		var hash = getHash(file);
		var noneMatch = req.headers['if-none-match'];
		if(hash === noneMatch){
			res.writeHead(304, "Not Modified");
			res.end();;
		}
		else{
			res.setHeader("Etag", hash);
			res.writeHead(200, "OK");
			res.end(file);
		}
	});
};
//为了让浏览器知道是否可以使用本地版本，需要设置Expires头或者Cache-Control头
var handle = function(req, res){
	fs.readFile(filename, function(err, file){
		var expires = new Date();
		expires.setTime(expires.getTime() + 10*365*24*60*60*1000);
		res.setHeader("Expires", expires.toUTCString());
		res.writeHead(200, "OK");
		res.end(file);
	});
};

var handle = function(req, res){
	fs.readFile(filename, function(err, file){
		res.setHeader("Cache-Control", "max-age=" + 10*365*24*60*60*1000);
		res.writeHead(200, "OK");
		res.end(file);
	});
};