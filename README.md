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

