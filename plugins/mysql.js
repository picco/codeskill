exports.attach = function (options) {
  var app = this;
  var _ = require('underscore');
  var async = require('async');
  var fs = require('fs');
  var mysql = require('mysql');

  app.mysql = {};

  app.mysql.read = mysql.createConnection(app.conf.mysql);
  app.mysql.read.connect();

  app.mysql.exec = mysql.createConnection(app.conf.mysql_exec);
  app.mysql.exec.connect();

  app.mysql.reset_sql = fs.readFileSync(app.dir + '/data/tests/cs_bands.sql');

  app.mysql.dataset = [
    {
      name: 'bands',
      columns: ['id (INT)', 'name (VARCHAR)', 'active_from (INT)', 'active_to (INT)'],
      sql: 'SELECT id, name, active_from, active_to FROM bands;',
    },
    {
      name: 'artists',
      columns: ['id (INT)', 'first_name (VARCHAR)', 'middle_name (VARCHAR)', 'last_name (VARCHAR)', 'born (DATE)', 'died (DATE)'],
      sql: "SELECT id, first_name, middle_name, last_name, DATE_FORMAT(born, '%Y-%m-%d'), DATE_FORMAT(died, '%Y-%m-%d') FROM artists;",
    },
    {
      name: 'band_members',
      columns: ['band_id (INT)', 'artist_id (INT)'],
      sql: "SELECT band_id, artist_id FROM band_members;",
    },
  ];

  app.mysql.extend = function(test, callback) {
    async.series([
      function(next) {
        app.mysql.loadDataset(function(dataset) {
          test.dataset = dataset;
          next();
        });
      },
      function(next) {
        app.mysql.safeExecute(test.sql.replace('__SOLUTION__', test.solution), function(err, rows, fields) {
          test.expected_table = app.mysql.renderTable(app.mysql.parseResult(rows));
          next(err);
        });
      },
    ], function(err) {
      callback(test);
    });
  }

  app.mysql.execute = function(test, mock, solution, callback) {
    var user_sql = test.sql.replace('__SOLUTION__', solution);
    var validation_sql = test.sql.replace('__SOLUTION__', test.solution);

    app.mysql.safeExecute(user_sql, function(err, user_rows) {
      if (err) {
        callback({
          pass: false,
          result: '',
          error: err.toString(),
        });
      }
      else {
        app.mysql.safeExecute(validation_sql, function(err, valid_rows) {
          if (err) console.error(err);
          callback({
            pass: _.isEqual(app.mysql.parseResult(user_rows), app.mysql.parseResult(valid_rows)),
            result_table: app.mysql.renderTable(app.mysql.parseResult(user_rows)),
            error: '',
          });
        });
      }
    });
  }

  app.mysql.safeExecute = function(sql, callback) {
    app.mysql.exec.query('START TRANSACTION;DROP DATABASE IF EXISTS cs_bands_rw;CREATE DATABASE cs_bands_rw;USE cs_bands_rw;' + app.mysql.reset_sql + sql + 'COMMIT;', callback);
  }

  app.mysql.loadDataset = function(callback) {
    var ds = app.mysql.dataset;

    async.each(ds, function(table, next) {
      app.mysql.read.query(table.sql, function(err, rows, fields) {
        if (err) console.error(err);
        table.data = app.mysql.parseResult(rows).data;
        next();
      });
    }, function(err) {
      callback(ds);
    });
  }

  app.mysql.parseResult = function(rows) {
    var result = {
      data: [],
    };

    if (rows) {
      for (var i in rows) {
        if (_.isArray(rows[i])) {
          for (var j in rows[i]) {
            result.data.push(_.values(rows[i][j]));
          }
        }
        else {
          if (!rows[i].serverStatus) {
            result.data.push(_.values(rows[i]));
          }
        }
      }
    }

    return result;
  }

  app.mysql.renderTable = function(result) {
    var html = '<table class="table table-condensed smaller">';

    for (var i in result.data) {
      html += '<tr>';

      for (var j in result.data[i]) {
        html += '<td>' + result.data[i][j] + '</td>';
      }

      html += '</tr>';
    };

    return html + '</table>';
  }
}

exports.init = function(done) {
  this.loadTests('mysql', done);
}
