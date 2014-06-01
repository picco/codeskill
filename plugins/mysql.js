exports.attach = function (options) {
  var app = this;
  var _ = require('underscore');
  var async = require('async');
  var fs = require('fs');
  var mysql = require('mysql');

  app.mysql = mysql.createConnection(app.conf.mysql);
  app.mysql.connect();

  app.mysql_exec = mysql.createConnection(app.conf.mysql_exec);
  app.mysql_exec.connect();

  app.mysql_reset_sql = fs.readFileSync(app.dir + '/tests/mysql/cs_bands.sql');

  app.mysql_dataset = [
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

  app.executeMySQL = function(test, solution, callback) {
    var user_sql = test.sql.replace('__SOLUTION__', solution);
    var validation_sql = test.sql.replace('__SOLUTION__', test.solution);

    app.executeQuery(user_sql, function(err, user_rows) {
      if (err) {
        callback({
          pass: false,
          result: '',
          error: err.toString(),
        });
      }
      else {
        app.executeQuery(validation_sql, function(err, valid_rows) {
          if (err) console.error(err);
          callback({
            pass: _.isEqual(app.parseResult(user_rows), app.parseResult(valid_rows)),
            result_table: app.renderTable(app.parseResult(user_rows)),
            error: '',
          });
        });
      }
    });
  }

  app.executeQuery = function(sql, callback) {
    app.mysql_exec.query('START TRANSACTION;DROP DATABASE IF EXISTS cs_bands_rw;CREATE DATABASE cs_bands_rw;USE cs_bands_rw;' + app.mysql_reset_sql + sql + 'COMMIT;', callback);
  }

  app.loadDataset = function(callback) {
    var ds = app.mysql_dataset;

    async.each(ds, function(table, next) {
      app.mysql.query(table.sql, function(err, rows, fields) {
        if (err) console.error(err);
        table.data = app.parseResult(rows).data;
        next();
      });
    }, function(err) {
      callback(ds);
    });
  }

  app.parseResult = function(rows) {
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

  app.renderTable = function(result) {
    var html = '<table class="table table-condensed">';

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