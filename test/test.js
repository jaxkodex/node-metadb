var assert = require('chai').assert;
var metadb = require('../lib/index');

describe('metadb', function () {
    this.timeout(2000);
    var meta;

    before(function () {
        meta = new metadb({
            username: process.env.username,
            password: process.env.password,
            host: process.env.host,
            database: process.env.database
        });
    });

    describe('#tablas', function () {
        it('should list tables on database', function (done) {
            meta.tables(function (results) {
                done();
            });
        });
    });

    describe('#foreign', function () {
        it('should list tables on database', function (done) {
            meta.foreign(function (results) {
                for (var r in results) {
                    console.log(results[r].references);
                }

                done();
            });
        });
    });
});
