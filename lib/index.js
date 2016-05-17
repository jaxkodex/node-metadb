var PGDataSource = require('./db/pg')

var metadb = function (options) {
    if (!options) options = {}

    this.options = options

    this.ds = new PGDataSource(this.options.username, this.options.password, this.options.host, this.options.database);
};

metadb.prototype.tables = function (callback) {
    var data = [];

    if (this.ds) {
        this.ds.tables('public', function (results) {
            callback(results);
        });
    }
};

metadb.prototype.foreign = function (callback) {
    var data = [];

    if (this.ds) {
        this.ds.foreign('public', function (results) {
            callback(results);
        });
    }
};

module.exports = metadb;
