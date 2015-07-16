//页面布局框架
//布局框架依旧由后端渲染而出


var cache = {};
var layout = 'layout.html';
var VIEW_FOLDER = '/path/to/wwwroot/views';

app.get('/profile', function(req, res){
	if(!cache[layout]){
		cache[layout] = fs.readFileSync(path.join(VIEW_FOLDER));
	}

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(render(complie(cache[layout])));
	ep.all('users', 'articles', function(){
		res.end();
	});
	ep.fail(function(err){
		res.end();
	});
	db.getData('sql1', function(err, data){
		data = err ? {} : data;
		res.write('<script>bigpipe.set("articles", ' + JSON.stringify(data) + ');</script>');
	});
	db.getData('sql2', function(err, data){
		data = err ? {} : data;
		res.write('<script>bigpipe.set("copyright", ' + JSON.stringify(data) + ');</script>');
	});
	//TODO
});

//布局模板文件
//这个布局文件需要引入必要的前端脚本，如jQuery，underscore，以及重要的bigpipe.js
//layout.html

<!DOCTYPE html>
<html>
<head>
	<title>Bigpipe示例</title>
	<script src="jquery.js"></script>
	<script src="underscore.js"></script>
	<script src="bigpipe.js"></script>
</head>
<body>
	<div id="body"></div>
	<script type="text/template" id="tpl_body">
		<div><%=articles%></div>
	</script>
	<div id="footer"></div>
	<script type="text/template" id="tpl_footer">
		<div><%=users%></div>
	</script>
</body>
</html>
<script type="text/javascript">
	var bigpipe = new Bigpipe();
	bigpipe.ready('articles', function(data){
		$('#body').html(_.render($('#tpl_body').html(), {articles: data}));
	});
	bigpipe.ready('copyright', function(data){
		$('#footer').html(_.render($('#tpl_footer').html(), {users: data}));
	});
</script>


