/*!
 * FreeMind
 * Copyright(c) 2014-2015 freemind
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
//通常将渲染方法设计为render()，参数就是模板路径和数据
//形成模板技术的四个要素:
//1.模板语言
//2.包含动态数据的数据对象
//3.拥有动态数据的数据对象
//4.模板引擎

//下面采用<% %>为标签创造一套模板引擎
//提取<%= %>的正则表达式为/<%=([\s\S]+?)%>/g
//模板引擎的步骤如下:
//语法分解
//处理表达式，将标签表达式转换成普通的语言表达式
//生成待执行语句
//与数据一起执行，生成最终字符串

/**
 * Module dependencies.
 */
var logger = require('./logger');
var handlers = require('./controllers/handlers');
var fs = require('fs');
var path = require('path');
var http = require('http');
var mime = require('mime');
var handle500 = handlers.handle500;

var res = module.exports = {
  __proto__: http.ServerResponse.prototype
};

//cache用于缓存模板
var cache = {};
var VIEW_FOLDER = './templates';

//子模板
//实现子模板的诀窍就是先将include语句进行替换,再进行整体性编译
var files = {};

//为了保证模板的安全性,预防xss漏洞，使用转义函数
var escape = function(html){
	return String(html)
			.replace(/&(?!\w+;)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;'); //IE不支持&apos;(单引号)转义
};

//模板编译技术中间生成函数只与模板字符串相关，与具体数据无关，如果每次生成这个
//中间函数，会浪费CPU，为了提升模板渲染性能，会使用模板预编译的方式

//<%= %>表示转义 <%- %>表示非转义
var complie = function(str){
	//模板技术，就是替换特殊字标签的技术
	//预解析子模板
	str = preComplie(str);
	var tpl  = str.replace(/\n/g, '\\n') //将换行符替换掉
	.replace(/\'/g, '\"')
	.replace(/<%=([\s\S+]+?)%>/g, function(match, code){
		//转义
		return "' + escape(" + code + ") + '";
	}).replace(/<%-([\s\S]+?)%>/g, function(match, code){
		//正常输出
		return "' + " + code + "+ '";
	}).replace(/<%([\s\S]+?)%>/g, function(match, code){
		//可执行代码
		return "';\n" + code + "\ntpl += '";
	}).replace(/\"\n/g, '\"')
	.replace(/\n\"/gm, '\"')
	.replace(/\s/gm, ' ');

	//为了使字符串继续表达为字符串，变量能够自寻找属于他的对象，这里使用with
	tpl = "tpl = '" + tpl + "';";
	//转换空行
	tpl = tpl.replace(/''/g, '\'\\n\'');
	tpl = 'var tpl = "";\nwith(obj || {}){\n' + tpl +'\n}\nreturn tpl;';
	//加上escape函数
	return new Function('obj', 'escape', tpl);
};


var preComplie = function(str){
	var replaced = str.replace(/<%\s+(include.*)\s+%>/g, function(match, code){
		var partial = code.split(/\s/)[1];
		if(!files[partial]){
			files[partial] = fs.readFileSync(path.join(VIEW_FOLDER, partial), 'utf8');
		}
		return files[partial];
	});

	//多层嵌套，继续替换
	if(str.match(/<%\s+(include.*)\s+%>/)){
		return preComplie(replaced);
	}
	else{
		return replaced;
	}
};

//布局视图
//为了避免母模板内容相同时，嵌入不同子模板导致的重复，使用布局视图
//这里设计<%- body%>用来替换子模板内容

var renderLayout = function(str, viewname){
	return str.replace(/<%-\s*body\s*%>/g, function(match, code){
		if(!cache[viewname]){
			cache[viewname] = fs.readFileSync(path.join(VIEW_FOLDER, viewname), 'utf8');
		}
		return cache[viewname];
	});
};

//res.render()方法修改如下
//如下，可以如此实现重用布局文件
//res.render('user', {
//	layout: 'layout.html',
//	users: []
//});
//或者
//res.render('profile', {
//	layout: 'layout.html',
//	users: []
//});
res.render = function render(viewname, data){
	var layout;
	if(data && data.hasOwnProperty('layout')){
		layout = data.layout;
	}
	if(layout){
		if(!cache[layout]){
			try{
				cache[layout] = fs.readFileSync(path.join(VIEW_FOLDER, layout), 'utf8');
			}
			catch(e){
				this.writeHead(500, {'Content-Type': 'text/html;charset=utf8'});
				this.end('布局文件错误');
				return;
			}
		}
	}
	var layoutContent = cache[layout] || '<%- body%>';

	var replaced;
	try{
		replaced = renderLayout(layoutContent, viewname);
	}
	catch(e){
		logger.error('模板文件错误'+e.toString());
		handle500(null, this);
		return;
	}
	//将模板和布局文件名做key缓存
	var key = viewname + ':' + (layout || '');
	if(!cache[key]){
		//编译模板
		cache[key] = complie(replaced);
	}
	this.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
	var html = cache[key](data, escape);
	this.end(html);
};

//附件下载
//Content-Disposition字段是用来判断报文数据是当浏览器内容还是可下载附件
//当时内容时，值为inline，当数据可以存为附件时为attachment
//还能通过参数指定保存时的文件名
//例如: Content-Disposition: attachment; filename="filename.txt"
//响应一个附件下载的API方法大致如下
res.sendfile = function sendfile(filepath){
	var self = this;
	fs.stat(filepath, function(err, stat){
		if(err){
			logger.error(err.toString());
		}
		var stream = fs.createReadStream(filepath);
		//设置内容
		self.setHeader('Content-Type', mime.lookup(filepath));
		//设置长度
		self.setHeader('Content-Length', stat.size);
		//设置附件
		self.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filepath) + '"');
		self.writeHead(200);
		stream.pipe(self);
	});
};

//响应JSON
res.json = function json(data){
	this.setHeader('Content-Type', 'application/json; charset=utf8');
	this.writeHead(200);
	this.end(JSON.stringify(data));
};

//响应跳转
res.redirect = function redirect(url){
	this.setHeader('Location', url);
	this.writeHead(302);
	this.end('Redirect to' + url);
};
