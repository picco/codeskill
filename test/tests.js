var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var broadway = require('broadway');
var demand = require('must');
var fs = require('fs');
var yaml = require('js-yaml');

var app = new broadway.App();
app.use(require('../plugins/main.js'));

runTests = function(language, code, next) {
  describe(code, function() {
    it('correct solution should pass with no errors', function(done) {
      app.loadTest(language, code, function(test) {
        app[language].execute(test, false, test.solution, function(result) {
          demand(test.solution).must.exist();
          result.pass.must.equal(true);
          result.error.must.be.empty();
          done();
        });
      });
    });
    it('mocked solution should pass with no errors', function(done) {
      app.loadTest(language, code, function(test) {
        if (test.mock_script) {
          app[language].execute(test, true, test.solution, function(result) {
            result.error.must.be.empty();
            result.result.must.equal(test.mocked_result);
            done();
          });
        }
        else {
          done();
        }
      });
    });
    it('cheat should not pass', function(done) {
      app.loadTest(language, code, function(test) {
        if (test.cheat) {
          app[language].execute(test, true, test.cheat, function(result) {
            result.pass.must.equal(false);
            result.error.must.equal('Please don\'t cheat');
            result.result.must.equal(test.expected_result);
            done();
          });
        }
        else {
          done();
        }
      });
    });
    next();
  });
}

function loadTests(language) {
  return yaml.load(fs.readFileSync(app.dir + '/data/tests/' + language + '.yml', {encoding: 'utf-8'}));
}

async.each(['php', 'js', 'mysql'], function(language, next_language) {
  async.each(loadTests(language), function(code, next_test) {
    runTests(language, code, next_test);
  }), next_language;
});

app.init(function (err) {
  if (err) console.error(err);
});
