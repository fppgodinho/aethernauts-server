var util                    = require('util');
var mongoose                = require('mongoose');
var Schema                  = mongoose.Schema;

module.exports              = {};
module.exports.schema       = function()                                        {
    Schema.apply(this, arguments);
    this.add({
        name:       String,
        flags:      [String],
        material:   Schema.Types.ObjectId,
        size:       Number,
        weight:     Number
    });
    
    this.statics.create = function(data)                                        {
        var item = new this(data);
        item.initialize();
        return item;
    };
    
    this.methods.addFlag    = function(flag)                                    {
        if (this.flags.indexOf(flag) <= 0) this.flags.push(flag);
    };
    
    this.methods.initialize   = function()                                      {
        this.addFlag("Item");
    }
};
util.inherits(module.exports.schema, Schema);

module.exports.instance                     = mongoose.model("Items", new module.exports.schema());
