const {Server} = require("socket.io");
const OnlineUser = require("../models/online-users-model");
const UserModel = require("../models/user-model");
const RoomsModel = require("../models/room-model");
const uuid = require("uuid");
const PostsModel = require("../models/posts-model");

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
    },
});

const  addNewUser = async (userId, socketId) => {
    const data = await OnlineUser.findOne({ socketId: socketId})
    if(!data){
        await OnlineUser.deleteMany({id: userId});
        await OnlineUser.create({id: userId,  socketId: socketId});
    }
};
const removeUser = async (socketId) => {
    await OnlineUser.deleteMany({socketId: socketId});
};

const getUser = async (id) => {
    const user = await OnlineUser.findOne({id: id});
    return user;
};

async function socket() {
    io.on("connection", (socket) => {
        console.log("Connected");
        socket.on("newUser", (userId) => {
            addNewUser(userId, socket.id);
        });

        socket.on('join_room', async (data) => {
            let room = "";
            const { userId, reciverId } = data;
            const roomItems =  await RoomsModel.find();
            const roomItem = roomItems.filter((item)=>item.user1 === userId && item.user2 === reciverId || item.user2 === userId && item.user1 === reciverId);

            if(!!roomItem[0]?.id){
                room = roomItem[0]?.id;
            }else{
                const roomId= uuid.v4();
                RoomsModel.create({id: roomId, user1: userId, user2: reciverId, history: []});
                room = roomId;
            }
            socket.join(room); // Join the user to a socket room
            let currentRoom = await RoomsModel.findOne({id: room});
            socket.emit('last_messages', currentRoom?.history);
        });

        socket.on('send_message', async (data) => {
            const { message, userId, reciverId, __createdTime__} = data;
            const roomItems =  await RoomsModel.find();
            const roomItem = roomItems.filter((item)=>item.user1 === userId && item.user2 === reciverId || item.user2 === userId && item.user1 === reciverId);
            await RoomsModel.findOneAndUpdate({id: roomItem[0]?.id}, {$push:{history:  {
                        id: uuid.v4(),
                        message: message,
                        username: userId,
                        __createdTime__: __createdTime__,
                        __createdDate__: new Date(__createdTime__).toLocaleDateString(),
                    }}}, {new: true});
            io.in(roomItem[0].id).emit('receive_message', data);
        });

        socket.on('leave_room', async (data) => {
            const { userId, reciverId } = data;
            const roomItem =  await RoomsModel.findOne({$or: [{user1: userId, user2: reciverId}, {user2: userId, user1: reciverId}]});
            socket.leave(roomItem?.id);
            console.log(`${userId} has left the chat`);
        });

        socket.on("sendNotification", async (data) => {
            const {senderId, receiverId, type} = data;
            const sender = await UserModel.findOne({_id: senderId});
            await UserModel.findByIdAndUpdate(receiverId, {$push:{notifications: {id: uuid.v4(),type: type, sender: sender.firstName, avatar: sender.avatar  }}}, {new: true});
            const receiver = await getUser(receiverId);
            const user = await UserModel.findOne({_id: receiverId});
            if(receiver){
                io.to(receiver.socketId).emit("getNotification", user.notifications);
            }
        });

        socket.on("likePost", async (data) => {
            const {userId, receiverId, postId, type} = data;
            const sender = await UserModel.findOne({_id: userId});
            const post = await PostsModel.findOne({_id: postId});
            if(!post?.likes?.includes(userId)){
                await PostsModel.findByIdAndUpdate(postId, {$push:{likes: userId}}, {new: true});
                await UserModel.findByIdAndUpdate(receiverId, {$push:{notifications: {id: uuid.v4(),type: type, sender: sender.firstName, avatar: sender.avatar  }}}, {new: true});
                const receiver = await getUser(receiverId);
                const user = await UserModel.findOne({_id: receiverId});
                io.to(socket.id).emit("getLike", {postId: postId, userId: userId, status: true});
                if(receiver){
                    io.to(receiver.socketId).emit("getNotification", user.notifications);
                }
            }else{
                await PostsModel.findByIdAndUpdate(postId, {$pull:{likes: userId}}, {new: true})
                io.to(socket.id).emit("getLike", {postId: postId, userId: userId, status: false});
            }
        });

        socket.on("disconnect", () => {
            console.log("Disconnected");
            removeUser(socket.id);
        });
    });

    io.listen(7001);
}

module.exports = socket;