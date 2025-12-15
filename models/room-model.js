const {Schema, model} = require("mongoose");

const RoomSchema = new Schema({
    id: {type: String, required: true},
    user1: {type: String},
    user2: {type: String},
    history: {type: Array}
});

module.exports = model("Rooms", RoomSchema);
