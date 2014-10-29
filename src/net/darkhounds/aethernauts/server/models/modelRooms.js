var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Continents";
    var _schema     = new Mongoose.Schema({
        name:           String,
        x:              String,
        y:              String,
        z:              String,
        area:           { type: Mongoose.Schema.Types.ObjectId, ref: 'Areas' },
        connections:    [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Connections' }]
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
