var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Connections";
    var _schema     = new Mongoose.Schema({
        dir:    String,
        x:      String,
        y:      String,
        z:      String,
        source: { type: Mongoose.Schema.Types.ObjectId, ref: 'Rooms' },
        target: { type: Mongoose.Schema.Types.ObjectId, ref: 'Rooms' }
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
