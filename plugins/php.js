exports.attach = function (options) {
  var app = this;
  var async = require('async');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var temp = require('temp').track();

  app.php = {};

  app.php.extend = function(test, callback) {
    test.script_head = '<?php' + "\n\n" + test.script_head;

    async.series([
      function(next) {
        app.php.execute(test, false, test.solution, function(result) {
          test.expected_result = result.result;
          next();
        });
      },
      function(next) {
        if (test.mock_script) {
          app.php.execute(test, true, test.solution, function(result) {
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

  app.php.execute = function(test, mock, solution, callback) {
    var script = "<?php\n";
    var result = {};

    script += (test.prep ? test.prep : '');
    script += (mock ? test.mock_script : test.script);
    script = script.replace('_SOLUTION_', solution);

    temp.open('test', function(err, info) {
      fs.writeSync(info.fd, script);

      exec('php -c /etc/php5/cli/php-sandbox.ini -f ' + info.path, {timeout: 1000}, function (error, stdout, stderr) {
        fs.close(info.fd, function(err) {
          temp.cleanup();
        });

        result.result = stdout.trim();
        result.pass = (mock ? (stdout == test.mocked_result) : (stdout == test.expected_result));
        result.error = stderr;

        if (result.error) {
          result.error = result.error.replace(/(in \/tmp\/test.+?) /i, '');
          result.error = result.error.replace(/on line \d+/, '');
        }

        if (mock && !result.pass) {
          result.error = 'Please don\'t cheat';
        }

        callback(result);
      });
    });
  }
}

exports.init = function(done) {
  this.loadTests('php', done);
}
