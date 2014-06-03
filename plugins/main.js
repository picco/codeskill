exports.attach = function (options) {
  var app = this;
  var _ = require('underscore');
  var async = require('async');
  var cache = require('memory-cache');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var temp = require('temp').track();
  var yaml = require('js-yaml');

  require('console-stamp')(console, 'isoDateTime');

  app.conf = require("config");
  app.dir = fs.realpathSync(__dirname + '/..');
  app.tests = {};

  app.use(require('./php.js'));
  app.use(require('./javascript.js'));
  app.use(require('./mysql.js'));

  app.loadData = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    var path = args.join('/');

    fs.readFile(app.dir + '/data/' + path + '.yml', {encoding: 'utf-8'}, function(err, data) {
      if (err) {
        console.error(err);
        callback(null);
      }
      else {
        callback(yaml.load(data));
      }
    });
  }

  app.loadTest = function(language, code, callback) {
    var key = 'test:' + language + ':' + code;
    console.log('asd');
    if (app.tests[language].all[code]) {
      if (cache.get(key)) {
        callback(cache.get(key));
      }
      else {
        app.loadData('tests', language, code, function(data) {
          var test = _.extend(data, app.tests[language].all[code]);

          if (test.script) {
            var matches = /([\s\S]*)_SOLUTION_([\s\S]*)/g.exec(test.script);
            test.script_head = matches[1].trim();
            test.script_foot = matches[2].trim();
          }

          app[language].extend(test, function(test) {
            cache.put(key, test);
            callback(test);
          });
        });
      }
    }
    else {
      callback(null);
    }
  }

  app.loadTests = function(language, callback) {
    app.tests[language] = {count: 0, all: {}};

    async.waterfall([
      function(next) {
        app.loadData('tests', language, function(tests) {
          next(null, tests);
        });
      },
      function(tests, next) {
        async.each(_.keys(tests), function(level, next_level) {
          async.each(tests[level], function(code, next_test) {
            app.tests[language][level] = {};

            app.loadData('tests', language, code, function(test) {
              var partial = {
                code: code,
                title: test.title,
                level: level,
                language: language,
              };

              app.tests[language].count++;
              app.tests[language].all[code] = partial;
              app.tests[language][level][code] = partial;

              next_test();
            });
          }, next_level);
        }, next);
      },
    ], function(err) {
      callback();
    });
  }

  app.listTests = function(language, level) {
    return _.values(app.tests[language][level]);
  }
}

exports.init = function(done) {
  process.setuid(this.conf.uid);
  done();
};
