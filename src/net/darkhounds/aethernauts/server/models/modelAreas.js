var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Continents";
    var _schema     = new Mongoose.Schema({
        name:   String,
        region: { type: Mongoose.Schema.Types.ObjectId, ref: 'Regions' }
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
