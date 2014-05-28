exports.attach = function (options) {
  var app = this;
  var _ = require('underscore');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var temp = require('temp').track();
  var yaml = require('js-yaml');

  app.dir = fs.realpathSync(__dirname + '/..');

  app.strings = {
    languages: {
      php: 'PHP',
      js: 'JavaScript',
      mysql: 'MySQL',
    }
  };

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
    if (app.tests[language][code]) {
      var path = app.dir + '/tests/' + language + '/' + code + '.yml';

      fs.readFile(path, {encoding: 'utf-8'}, function(err, data) {
        if (err) {
          callback(null);
        }
        else {
          var test = yaml.load(data);

          test.language = language;
          test.code = code;
          test.level = app.tests[language][code].level;
          test.title = app.tests[language][code].title;

          var matches = /([\s\S]*)_SOLUTION_([\s\S]*)/g.exec(test.script);
          test.script_head = matches[1].trim();
          test.script_foot = matches[2].trim();

          if (language == 'php') {
            test.script_head = '<?php' + (test.script_head ? ("\n\n" + test.script_head) : '');
          }

          callback(test);
        }
      });
    }
    else {
      callback(null);
    }
  }

  app.nextURL = function(test) {
    var tests = app.listTests(test.language, test.level, true);
    var currentIndex = tests.indexOf(test.code);

    if (tests[currentIndex + 1]) {
      return '/test/' + test.language + '/' + tests[currentIndex + 1];
    }
    else {
      return '/tests/php';
    }
  }

  app.execute = function(test, mock, solution, callback) {
    if (test.language == 'php') {
      app.executePHP(test, mock, solution, callback);
    }
    else if (test.language == 'js') {
      app.executeJS(test, mock, solution, callback);
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

        callback({
          pass: pass,
          result: stdout,
          error: stderr,
          cheat: (mock && !pass),
        });
      });
    });
  }

  app.executeJS = function(test, mock, solution, callback) {
    var script = '';

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

        stdout = stdout.trim();

        var pass = (mock ? (stdout == test.mocked_result) : (stdout == test.expected_result));

        callback({
          pass: pass,
          result: stdout,
          error: stderr,
          cheat: (mock && !pass),
        });
      });
    });
  }

  app.getTestCount = function(language) {
    return _.keys(app.tests[language]).length;
  }

}
