const PostsModel = require("../models/posts-model");
const UserModel = require("../models/user-model");
const ApiError = require("../exceptions/api-error");
const {ObjectId} = require("mongodb");

class PostsService {
    async addPost(text, date, type, idFile, pathToFile, user) {
        const post = await PostsModel.create({text, date, type, idFile, pathToFile, user, likes: 0});
        return post;
    }

    async getAllPosts(userId) {
        const user = await UserModel.findOne({_id: userId});

        const friendIds = user?.friends;
        const result = await PostsModel.find({user: {$in: friendIds}})
            .populate("user", "name")
            .exec()
            .then((friendsPosts) => {
                return friendsPosts;
            })
            .catch((err) => {
                console.error('Error querying posts:', err);
                return err;
            })

        return result;
    }

}

module.exports = new PostsService();
