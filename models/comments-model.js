const {Schema, model} = require("mongoose");

const CommentsSchema = new Schema({
    user_id: {type: String, required: true},
    post_id: {type: String, required: true},
    text: {type: String, required: true},
    date: {type: Date, required: true},
});

module.exports = model("Comments", CommentsSchema);
