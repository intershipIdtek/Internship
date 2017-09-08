var MongoClient = require('mongodb').MongoClient;
var dbName = 'okdb';
var connectionString = `mongodb://localhost:27017/${dbName}`;

exports.collection = function (collectionName) {

    var _db;
    var _collection = collectionName;
    var _onSuccess;
    var _onError;
    var _callback;

    this.perform = function () {
        MongoClient.connect(connectionString, function (err, db) {
            if (err) throw err;
            _db = db;
            _callback();
        });
    }

    this.onSuccess = function (callback) {
        _onSuccess = callback;
        return this;
    }

    this.onError = function (callback) {
        _onError = callback;
        return this;
    }

    this.add = function (itemArray) {
        _callback = () => {
            _db.collection(_collection).insertMany(itemArray, function (err, res) {
                _db.close();
                if (err) {
                    console.error(err);
                    _onError && _onError(err);
                    return;
                }
                console.log(`Added [${res.insertedCount}] items to [${_collection}]`);
                _onSuccess && _onSuccess(res);
            });
        };
        return this;
    }

    this.update = function (query, newValue) {
        _callback = () => {
            _db.collection(_collection).updateMany(query, newValue, function (err, res) {
                _db.close();
                if (err) {
                    console.error(err);
                    _onError && _onError(err);
                    return;
                }
                console.log(`Updated [${res.result.nModified}] items in [${_collection}]`);
                _onSuccess && _onSuccess({ modifiedCount: res.modifiedCount });
            });
        };
        return this;
    }

    this.remove = function (query) {
        _callback = () => {
            _db.collection(_collection).deleteMany(query, function (err, res) {
                _db.close();
                if (err) {
                    console.error(err);
                    _onError && _onError(err);
                    return;
                }
                console.log(`Removed [${res.result.n}] items from [${_collection}]`);
                _onSuccess && _onSuccess({ deletedCount: res.deletedCount });
            });
        };
        return this;
    }

    this.get = function (query) {
        _callback = () => {
            _db.collection(_collection).find(query).toArray(function (err, result) {
                _db.close();
                if (err) {
                    console.error(err);
                    _onError && _onError(err);
                    return;
                }
                _onSuccess && _onSuccess(result);
            });
        };
        return this;
    }

    return this;
}
