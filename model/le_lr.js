const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let le_lr = new Schema({
    _id : String,
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
module.exports = mongoose.model('le_lr', le_lr);