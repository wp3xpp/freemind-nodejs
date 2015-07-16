//浏览器通过Content-Type的值决定不同的渲染方式，称为MIME值
//可以使用mime模块判断文件类型
//以下为调用方法

var mime = require("mime");

mime.lookup('/path/to/file.txt'); // =>'text/plain'
mime.lookup('/file.txt'); // =>'text/plain'
mime.lookup('.TXT'); // =>'text/plain'
mime.lookup('htm'); // =>'text/html'

//附件下载
//Content-Disposition字段是用来判断报文数据是当浏览器内容还是可下载附件
//当时内容时，值为inline，当数据可以存为附件时为attachment
//还能通过参数指定保存时的文件名
//例如: Content-Disposition: attachment; filename="filename.txt"
//响应一个附件下载的API方法大致如下
res.sendfile = function(filepath){
	fs.stat(filepath, function(err, stat){
		var stream = fs.createReadStream(filepath);
		//设置内容
		res.setHeader('Content-Type', mime.lookup(filepath));
		//设置长度
		res.setHeader('Content-Length', stat.size);
		//设置附件
		res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filepath) + '"');
		res.writeHead(200);
		stream.pipe(res);
	});
};

//响应JSON
res.json = function(json){
	res.setHeader('Content-Type', 'application/json');
	res.writeHead(200);
	res.end(JSON.stringify(json));
};

//响应跳转
res.redirect = function(url){
	res.setHeader('Location', url);
	res.writeHead(302);
	res.end('Redirect to' + url);
}