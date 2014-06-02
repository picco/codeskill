var broadway = require('broadway');
var app = new broadway.App();

app.use(require('./plugins/main.js'));
app.use(require('./plugins/server.js'));

app.init(function (err) {
  if (err) console.error(err);
});
