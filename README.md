#freemind-nodejs

  Fast, unopinionated, minimalist web framework for [node](http://nodejs.org).

```js
var freemind = require('freemind')
var app = freemind()

app.get('/', function (req, res) {
  res.end('Hello World')
})

app.listen(3000)
```
## Installation

```bash
$ npm install freemind
or
$ git clone git@github.com:wp3xpp/freemind-nodejs.git
```
## Features

  * 轻量级框架
  * Restful
  * 中间件
  * 快速构建
  * 一个功能完整的Blog Demo供您参考
  * 异步，事件驱动
  * 日志记录，完备的日志调试功能
  * HTTP helpers (redirection, caching, etc)
  
##Usage

###路由注册:

可以使用类似如下方法注册中间件方法
```javascript  
app.use(querystring)
app.use(cookie)
app.use(session)
app.get('/user/:username', getUser)
app.put('/user/:username', authorize, updateUser)
app.get('/static/*', staticFile)
```
可以使用通配符*匹配任何字符串
使用类似
```javascript
app.get('/user/:username', getUser);
```
可以匹配如`/user/freemind => req.params.username = 'freemind'`
访问匹配路径时，它将被捕获并挂载在`req.params.username`上。
注意，这里的`:username` 冒号后面的值不能带有除`[a-zA-Z0-9]`之外的值

注意:默认的路由功能中，404响应将被捕获并由 `handlers.handle404`处理，你可以按照你的喜好修改

###中间件:

  * 目前已集成如下中间件:
  * getQueryString 捕获GET请求的querystring，挂载在req.query上
  * cookie 获取cookie 挂载在req.cookies上
  * session 生成基于cookie的session,目前数据存在于内存中，下个版本准备用redis缓存,挂载在req.session上
  * basic BASIC验证中间件
  * handleData 获取post报文内容并挂载在req.rawBody上
  * handlePostdata 解析post报文内容，按照分类挂载在req.body上

###ORM:

使用已经成熟的orm2框架，model的编写可以参考`models.js`
数据库的配置文件在`./config/dbConfig.js`文件中

下面是一段orm2 example，具体可移步[orm documents](https://github.com/dresende/node-orm2).

```javascript
var orm = require("orm");

orm.connect("mysql://username:password@host/database", function (err, db) {
  if (err) throw err;

    var Person = db.define("person", {
        name      :String,
        surname   :String,
        age       :Number,
        male      :Boolean,
        continent : [ "Europe", "America", "Asia", "Africa", "Australia", "Antartica" ], // ENUM type
        photo     : Buffer, // BLOB/BINARY
        data      :Object// JSON encoded
    }, {
        methods: {
            fullName:function () {
                returnthis.name +' '+this.surname;
            }
        },
        validations: {
            age: orm.validators.rangeNumber(18, undefined, "under-age")
        }
    });

    Person.find({ surname:"Doe" }, function (err, people) {
        // SQL: "SELECT * FROM person WHERE surname = 'Doe'"

        console.log("People found: %d", people.length);
        console.log("First person: %s, age %d", people[0].fullName(), people[0].age);

        people[0].age =16;
        people[0].save(function (err) {
            // err.msg = "under-age";
        });
    });
});
```
注意，我发现orm2链式调用多次时会出现显示重复数据的bug，所以尽量少用链式调用.


###response:

  * response已集成如下方法
  * render，使用方法下面详述
  * sendfile, 给客户端发送流文件
  * json, 响应json格式数据
  * redirect， 重定向
  * setCookie， 设置cookie

关于render的 example：

```javascript
res.render('404.html', {})
res.render('index.html', {layout: 'base.html', user: user})
```
render方法接受两个参数，第一个参数为响应使用过的模板文件，格式为templates文件夹下面的文件名，第二个参数为字典形式，layout的值为模板文件的母文件，没有可以不填，其他为传给模板的数据，可以在模板中有如下调用：
```javascript
<%= user.name%> //<%= %>中包裹的是从后台传来的数据
<%- <p>Hello World</p>%>  //<%- %>中包裹的数据不会被解析
<% %> //逻辑可以被包裹在里面
<%- body%> //如果使用母模板，<%- body%>将被替换为子模板中的内容
<%include a.html%> //如果使用模板嵌套，可以使用该方法替换被嵌套模板
```

注意，模板功能相对较弱，并且现在并不推荐将逻辑与视图混在一起写，推荐使用MVVM框架如`Vue，Angularjs`，或者设计api接口，用ajax完成前后端分离。

###request:
  
  * 目前request只集成了`header`方法，写着只是为了便于后期拓展。

-----------------------------------
##Blog Demo

下面是我使用freemind框架写的一套博客系统。前端采用咱们国人的amazeUI框架

要使用这套博客系统，需要安装mysql，然后在`./config/dbConfig`中按照本地环境修改配置，
配置好了之后，使用`node runBlog.js`就可以运行了，访问`http://127.0.0.1:8000`就可以了。

下面是效果图:
####首页
![](http://pfile.cn/0zt94c)
####博客阅读页 支持MarkDown语法编辑博客
![](http://pfile.cn/qpqfjh)
####注册页
![](http://pfile.cn/s808hg)
####博客管理
![](http://pfile.cn/x4mihy)

![](http://pfile.cn/5hjoxp)
####用户管理
![](http://pfile.cn/jnlwcw)
####博客编辑
![](http://pfile.cn/lrul5m)

 * 整套博客系统代码都包含在了包中，用作参考。

后续需要完成的工作
------------------------------

  0. *增加文件变动自动重载功能，打算用已有的forever模块实现。*
  1. *session功能用redis实现。*
  2. *增强模板功能。*
  3. *引入多进程。*
  4. *耦合性较高，需要解耦合。*
  5. *捉虫，编写测试用例。*
  6. *继续完善文档。*