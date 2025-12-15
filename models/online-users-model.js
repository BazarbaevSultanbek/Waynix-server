const {Schema, model} = require("mongoose");

const OnlineUsersSchema = new Schema({
    id: {type: String},
    socketId: {type: String},
});

module.exports = model("OnlineUser", OnlineUsersSchema);
