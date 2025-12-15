const {Schema, model} = require("mongoose");
const {ObjectId} = require("mongodb");

const PostsSchema = new Schema({
    text: {type: String, required: true},
    file: {type: String},
    likes: {type: Array},
    type: {type: String, required: true},
    idFile: {type:String, required: true},
    pathToFile: {type: String, default: ''},
    date: {type: Date, default: Date.now()},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    comments: [{type: Schema.Types.ObjectId, ref: 'comments'}]
});

module.exports = model("Posts", PostsSchema);
