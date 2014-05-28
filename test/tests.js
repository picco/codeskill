var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var broadway = require('broadway');
var demand = require("must");

var app = new broadway.App();
app.use(require('../plugins/tests.js'));
app.use(require('../plugins/main.js'));

runTests = function(language, code, next) {
  describe(code, function() {
    it('correct solution should pass', function(done) {
      app.loadTest(language, code, function(test) {
        app.execute(test, false, test.solution, function(result) {
          demand(test.solution).must.exist();
          result.pass.must.equal(true);
          result.error.must.be.empty();
          done();
        });
      });
    });
    it('mocked solution should yield to according output', function(done) {
      app.loadTest(language, code, function(test) {
        if (test.mock_script) {
          app.execute(test, true, test.solution, function(result) {
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
          app.execute(test, true, test.cheat, function(result) {
            result.pass.must.equal(false);
            result.cheat.must.equal(true);
            result.error.must.be.empty();
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

describe('PHP', function() {
  async.each(_.keys(app.tests.php), function(code, next) {
    runTests('php', code, next);
  });
});

describe('JavaScript', function() {
  async.each(_.keys(app.tests.js), function(code, next) {
    runTests('js', code, next);
  });
});

app.init(function (err) {
  if (err) {
    console.log(err);
  }
});
