const CommentsModel = require("../models/comments-model");
const ApiError = require("../exceptions/api-error");

class PostsService{
    async addComment(user_id, post_id, text, date){
        const comment = await CommentsModel.create({user_id, post_id, text, date});
        return comment;
    }
    async getAllComments() {
        const comments = await CommentsModel.find();
        return comments;
    }

}

module.exports = new PostsService();
