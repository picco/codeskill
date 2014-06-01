exports.attach = function (options) {
  var app = this;
  var async = require('async');
  var bodyParser = require('body-parser')
  var express = require('express');
  var hbs = require('express-hbs');

  hbs.registerHelper('conditionalClass', function(current, selected, className) {
    return (current == selected) ? className : '';
  });

  hbs.registerHelper('getValue', function(outer, inner) {
    return outer[inner];
  });

  hbs.registerHelper('toupper', function(options) {
      return options.fn(this).toUpperCase();
  });

  hbs.registerHelper('eq', function(val, val2, options) {
    if (val == val2) {
      console.dir(val + ' ' + val2);
      return options.fn(this);
    }
  });

  app.server = express();

  app.server.engine('hbs', hbs.express3({
    partialsDir: app.dir + '/views/partials'
  }));

  app.server.locals.strings = app.strings;

  app.server.use(express.static(app.dir + '/public'));
  app.server.use(bodyParser());

  app.server.set('view engine', 'hbs');
  app.server.set('views', app.dir + '/views');

  app.server.get('/', function(req, res) {
    res.render('index', {
      php_count: app.getTestCount('php'),
      js_count: app.getTestCount('js'),
      mysql_count: app.getTestCount('mysql'),
    });
  });

  app.server.get('/tests/:language', function(req, res) {
    var tests = {
      beginner: app.listTests(req.params.language, 'beginner'),
      intermediate: app.listTests(req.params.language, 'intermediate'),
      advanced: app.listTests(req.params.language, 'advanced'),
    };

    res.render('tests', {
      tests: tests,
      language: req.params.language,
    });
  });

  app.server.get('/test/:language/:code', function(req, res) {
    app.loadTest(req.params.language, req.params.code, function(test) {
      if (test) {
        res.render('test', {
          test: test,
          language: req.params.language,
          beginner: app.listTests(req.params.language, 'beginner'),
          intermediate: app.listTests(req.params.language, 'intermediate'),
          advanced: app.listTests(req.params.language, 'advanced'),
        });
      }
      else {
        res.send(500);
      }
    });
  });

  app.server.get('/solve/:language/:code', function(req, res) {
    app.loadTest(req.params.language, req.params.code, function(test) {
      if (test) {
        res.send(test.solution.trim());
      }
      else {
        res.send(500);
      }
    });
  });

  app.server.post('/execute', function(req, res) {
    app.loadTest(req.body.language, req.body.code, function(test) {
      if (test) {
        app.execute(test, false, req.body.solution, function(test_result) {
          if (test_result.pass && test.mock_script) {
            app.execute(test, true, req.body.solution, function(mock_result) {
              mock_result.result = test_result.result;
              res.send(mock_result);
            });
          }
          else {
            res.send(test_result);
          }
        });
      }
      else {
        res.send({pass: false, result: false, error: 'System error.'});
      }
    });
  });
}

exports.init = function(done) {
  require('http').createServer(this.server).listen(80);
  done();
}
