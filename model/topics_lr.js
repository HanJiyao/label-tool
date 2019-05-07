const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
let topics_lr = new Schema({
    _id : ObjectId,
    old_topics_keys : [String],
    original_key : String,
    keywords : [String],
    old_topics : [String],
    label : String,
    ui_text : [String]
}, {
    versionKey: false // You should be aware of the outcome after set to false
});
module.exports = mongoose.model("Topics", topics_lr, "topics_lr");