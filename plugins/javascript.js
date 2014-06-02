exports.attach = function (options) {
  var app = this;
  var async = require('async');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var temp = require('temp').track();

  app.js = {};

  app.js.extend = function(test, callback) {
    async.series([
      function(next) {
        app.js.execute(test, false, test.solution, function(result) {
          test.expected_result = result.result;
          next();
        });
      },
      function(next) {
        if (test.mock_script) {
          app.js.execute(test, true, test.solution, function(result) {
            test.mocked_result = result.result;
            next();
          });
        }
        else {
          next();
        }
      },
    ], function(err) {
      callback(test);
    });
  }

  app.js.execute = function(test, mock, solution, callback) {
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
}

exports.init = function(done) {
  this.loadTests('js', done);
}
