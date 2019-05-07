const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
let le_lr = new Schema({
    _id : ObjectId,
    topic : String,
    'complimentary topics' : String,
    title : String,
    'complimentary entropy' : String,
    tenant : String,
    subject_area : String,
    type : String,
    item_type : String,
    description : String,
    entropy : String,
    sa_key : String
});
module.exports = mongoose.model("LearningItems", le_lr, "le_lr");