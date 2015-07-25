//通常将渲染方法设计为render()，参数就是模板路径和数据

res.render = function(view, data){
	res.setHeader('Content-Type', 'text/html');
	res.writeHead(200);
	//实际渲染
	var html = render(view, data);
	res.end(html);
};

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

var render = function(str, data){
	//模板技术，就是替换特殊字标签的技术
	var tpl = str.replace(/<%=(\s\S)+?%>/g, function(match, code){
		return "' + obj." + code + "+ '";
	});

	tpl = "var tpl = '" + tpl + "'\nreturn tpl;";
	var complied = new Function('obj', tpl);
	return complied(data);
};

//为了保证模板的安全性,预防xss漏洞，使用转义函数
var escape = function(html){
	return String(html)
			.replace(/&(?!\w+;)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;'); //IE不支持&apos;(单引号)转义
};

//调用上述模板函数如下:
//var tpl = 'Hello <%=username%>.';
//console.log(render(tpl, {username: 'hushwiei'}));
// =>Hello hushiwei

//上述模板编译技术中间生成函数只与模板字符串相关，与具体数据无关，如果每次生成这个
//中间函数，会浪费CPU，为了提升模板渲染性能，会使用模板预编译的方式

//<%= %>表示转义 <%- %>表示非转义
var complie = function(str){
	//模板技术，就是替换特殊字标签的技术
	//预解析子模板
	str = preComplie(str);
	var tpl  = str.replace(/\n/g, '\\n') //将换行符替换掉
	.replace(/<%=(\s\S)+?%>/g, function(match, code){
		//转义
		return "' + escape(" + code + ") + '";
	}).replace(/<%=(\s\S)+?%>/g, function(match, code){
		//正常输出
		return "' + " + code + "+ '";
	}).replace(/<%(\s\S)+?%>/g, function(match, code){
		//可执行代码
		return "';\n" + code + "\ntpl += '";
	}).replace(/\'\n/g, '\'')
	.replace(/\n\'/gm, '\'');

	//为了使字符串继续表达为字符串，变量能够自寻找属于他的对象，这里使用with
	tpl = "tpl = '" + tpl + "'";
	tpl = 'var tpl = "";\nwith(obj || {}){\n' + tpl +'\n}\nreturn tpl;';
	//加上escape函数
	return new Function('obj', 'escape', tpl);
};

//一次编译，多次执行
//var complied = complie(view);
var render = function(complied, data){
	return complied(data);
};

//集成文件系统,响应一个客户端的请求大致如下
app.get('/path', function(req, res){
	fs.readFile('file/path', 'utf8', function(err, text){
		if(err){
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end('模板文件错误');
			return;
		}
		res.writeHead(200, {'Content-Type': 'text/html'});
		var html = render(complie(text), data);
		res.end(html);
	});
});

//但是上面的写法会导致每次请求都要编译和读取磁盘上的文件
//做如下改进

var cache = {};
var VIEW_FOLDER = '/www/templates';

res.render = function(viewname, data){
	if(!cache[viewname]){
		var text;
		try{
			text = fs.readFileSync(path.join(VIEW_FOLDER, viewname), 'utf8');
		}
		catch(e){
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end('模板文件错误');
			return;
		}
		cache[viewname] = complie(text);
	}
	var complied = cache[viewname];
	res.writeHead(200, {'Content-Type': 'text/html'});
	var html = complied(data);
	res.end(html);
};

//调用方式如下
//引入缓存可以很好的解决性能问题，接口也得到简化
app.get('/path', function(req, res){
	res.render('viewname', {});
});

//子模板
//实现子模板的诀窍就是先将include语句进行替换,再进行整体性编译
var files = {};

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
res.render = function(viewname, data){
	var layout = data.layout;
	if(layout){
		if(!cache[layout]){
			try{
				cache[layout] = fs.readFileSync(path.join(VIEW_FOLDER, layout), 'utf8');
			}
			catch(e){
				res.writeHead(500, {'Content-Type': 'text/html'});
				res.end('布局文件错误');
				return;
			}
		}
	}
	var layoutContent = cache[layout] || '<%-body%>';

	var replaced;
	try{
		replaced = renderLayout(layoutContent, viewname);
	}
	catch(e){
		res.writeHead(500, {'Content-Type': 'text/html'});
		res.end('模板文件错误');
		return;
	}
	//将模板和布局文件名做key缓存
	var key = viewname + ':' + (layout || '');
	if(!cache[key]){
		//编译模板
		cache[key] = complie(replaced);
	}
	res.writeHead(200, {'Content-Type': 'text/html'});
	var html = cache[key](data);
	res.end(html);
};

