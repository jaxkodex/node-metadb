var pg = require('pg'),
    pgp = require('pg-promise')(),
    util = require('util');

var PGDataSource = function (username, password, host, database) {
    this.url = util.format("postgres://%s:%s@%s/%s", username, password, host, database);
    this.db = pgp(this.url);
};

PGDataSource.prototype.tables = function (schema, callback) {
    var me = this;
    if (!schema) schema = 'public';
    //var tablesQuery = util.format("select * from pg_tables where schemaname = '%s'", schema);
    //var tablesQuery = util.format("select * from information_schema.tables where table_schema = '%s'", schema);
    var tablesQuery = util.format("SELECT table_catalog, table_schema, table_name, column_name, is_nullable, data_type, character_maximum_length FROM information_schema.columns WHERE table_schema = '%s'", schema);

    this.db.any(tablesQuery, true)
        .then(function (data) {
            var tableHash = {};

            var rows = [];

            for (var i = 0; i < data.length; i++) {
                var table = tableHash[data[i]['table_name']];

                if (!table) {
                    table = {
                        name: data[i]['table_name'],
                        columns: []
                    };
                    tableHash[data[i]['table_name']] = table;
                }

                table.columns.push({
                    name: data[i]['column_name'],
                    isNullable: data[i]['is_nullable'],
                    dataType: data[i]['data_type'],
                    maxLen: data[i]['character_maximum_length']
                });
            }

            for (var k in tableHash) {
                rows.push(tableHash[k]);
            }

            callback(rows);
        });
};

PGDataSource.prototype.foreign = function (schema, callback) {
    if (!schema) schema = 'public';
    var foreignQuery = util.format("SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY' AND tc.constraint_schema='%s'", schema);
    this.db.any(foreignQuery, true)
        .then(function (data) {
            var tableHash = {};

            var rows = [];

            for (var i = 0; i < data.length; i++) {
                var table = tableHash[data[i]['table_name']];

                if (!table) {
                    table = {
                        name: data[i]['table_name'],
                        references: []
                    };
                    tableHash[data[i]['table_name']] = table;
                }

                table.references.push({
                    constraintName: data[i]['constraint_name'],
                    columnName: data[i]['column_name'],
                    foreignTable: data[i]['foreign_table_name'],
                    foreignColumn: data[i]['foreign_column_name']
                });
            }

            for (var k in tableHash) {
                rows.push(tableHash[k]);
            }
            callback(rows);
        });
};

module.exports = PGDataSource
