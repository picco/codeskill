exports.attach = function (options) {
  var app = this;
  var _ = require('underscore');
  var async = require('async');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var temp = require('temp').track();
  var yaml = require('js-yaml');

  app.conf = require("config");
  app.dir = fs.realpathSync(__dirname + '/..');

  app.strings = {
    languages: {
      php: 'PHP',
      js: 'JavaScript',
      mysql: 'MySQL',
    },
    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    }
  };

  app.use(require('./mysql.js'));

  app.listTests = function(language, level, keys) {
    var tests = [];

    for (var code in app.tests[language]) {
      if (app.tests[language][code].level == level) {
        if (keys) {
          tests.push(code);
        }
        else {
          app.tests[language][code].language = language;
          app.tests[language][code].code = code;
          tests.push(app.tests[language][code]);
        }
      }
    }

    return tests;
  }

  app.loadTest = function(language, code, callback) {
    var test = {};
    var path = app.dir + '/tests/' + language + '/' + code + '.yml';

    async.waterfall([
      function(next) {
        app.tests[language][code] ? next() : next(true);
      },
      function(next) {
        fs.readFile(path, {encoding: 'utf-8'}, next);
      },
      function(data, next) {
        test = yaml.load(data);

        test.language = language;
        test.code = code;
        test.level = app.tests[language][code].level;
        test.title = app.tests[language][code].title;

        if (test.script) {
          var matches = /([\s\S]*)_SOLUTION_([\s\S]*)/g.exec(test.script);
          test.script_head = matches[1].trim();
          test.script_foot = matches[2].trim();
        }

        if (language == 'php') {
          test.script_head = '<?php' + (test.script_head ? ("\n\n" + test.script_head) : '');
        }

        next();
      },
      function(next) {
        if (test.language == 'mysql') {
          app.loadDataset(function(dataset) {
            test.dataset = dataset;
            next();
          });
        }
        else {
          next();
        }
      },
      function(next) {
        if (test.language == 'mysql') {
          app.executeQuery(test.sql.replace('__SOLUTION__', test.solution), function(err, rows, fields) {
            test.expected_table = app.renderTable(app.parseResult(rows));
            next(err);
          });
        }
        else {
          next();
        }
      },
    ],
    function(err, results) {
      if (err) {
        console.error(err);
        callback(null);
      }
      else {
        callback(test);
      }
    });
  }

  app.execute = function(test, mock, solution, callback) {
    if (test.language == 'php') {
      app.executePHP(test, mock, solution, callback);
    }
    else if (test.language == 'js') {
      app.executeJS(test, mock, solution, callback);
    }
    else if (test.language == 'mysql') {
      app.executeMySQL(test, solution, callback);
    }
    else {
      callback(null);
    }
  }

  app.executePHP = function(test, mock, solution, callback) {
    var script = "<?php\n";

    script += (test.prep ? test.prep : '');
    script += (mock ? test.mock_script : test.script);
    script = script.replace('_SOLUTION_', solution);

    temp.open('test', function(err, info) {
      fs.writeSync(info.fd, script);

      exec('php -f ' + info.path, {timeout: 1000}, function (error, stdout, stderr) {
        fs.close(info.fd, function(err) {
          temp.cleanup();
        });

        stdout = stdout.trim();

        var pass = (mock ? (stdout == test.mocked_result) : (stdout == test.expected_result));

        if (stderr) {
          stderr = stderr.replace(/(in \/tmp\/test.+?) /i, '');
          stderr = stderr.replace(/on line \d+/, '');
        }

        if (mock && !pass) {
          error = 'Please don\'t cheat';
        }

        callback({
          pass: pass,
          result: stdout,
          error: stderr,
        });
      });
    });
  }

  app.executeJS = function(test, mock, solution, callback) {
    var script = '';
    var result = {};

    script += "(function(window, require, phantom) {\n";
    script += (test.prep ? test.prep : '');
    script += (mock ? test.mock_script : test.script);
    script += (test.validation_script ? test.validation_script : '');
    script += "})({location: ''}, undefined, undefined);\n\nphantom.exit(0);";

    script = script.replace('_SOLUTION_', solution);

    temp.open('test', function(err, info) {
      fs.writeSync(info.fd, script);

      exec('phantomjs ' + app.dir + '/run.js ' + info.path, {timeout: 1000}, function (error, stdout, stderr) {
        fs.close(info.fd, function(err) {
          temp.cleanup();
        });

        result.result = stdout.trim();
        result.pass = (mock ? (result.result == test.mocked_result) : (result.result == test.expected_result));
        result.error = stderr;

        if (mock && !result.pass) {
          result.error = 'Please don\'t cheat';
        }

        if (error) {
          result.error = result.result;
          result.result = 'No output';
        }

        callback(result);
      });
    });
  }

  app.getTestCount = function(language) {
    return _.keys(app.tests[language]).length;
  }

}
